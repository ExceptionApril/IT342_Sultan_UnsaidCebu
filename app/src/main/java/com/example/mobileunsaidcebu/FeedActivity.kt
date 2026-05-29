package com.example.mobileunsaidcebu

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.*
import android.graphics.drawable.BitmapDrawable
import android.os.Bundle
import android.os.Looper
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import org.osmdroid.config.Configuration
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker

class FeedActivity : AppCompatActivity() {

    private lateinit var session: SessionManager
    private lateinit var mapView: MapView
    private lateinit var fusedLocation: FusedLocationProviderClient
    private lateinit var bottomNav: BottomNavigationView
    private lateinit var fabCompose: FloatingActionButton
    private lateinit var mapPanel: View
    private lateinit var listPanel: View
    private lateinit var profilePanel: View
    private lateinit var rvPosts: RecyclerView
    private lateinit var postsAdapter: PostsAdapter
    private lateinit var tvEmptyList: TextView
    private lateinit var progressBar: ProgressBar

    private var posts: List<PostDto> = emptyList()
    private var userLocation: GeoPoint? = null
    private var userMarker: Marker? = null
    private var hasFirstFix = false
    private var locationCallback: LocationCallback? = null
    private val CEBU = GeoPoint(10.3157, 123.8854)
    // Anything farther than this from Cebu is treated as a bogus fix and ignored.
    private val CEBU_REGION_RADIUS_M = 300_000.0  // ~300 km
    private val LOCATION_PERM = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Configuration.getInstance().load(this, getPreferences(MODE_PRIVATE))
        setContentView(R.layout.activity_feed)

        session = SessionManager(this)
        if (!session.isLoggedIn()) { logout(); return }

        bindViews()
        setupMap()
        setupRecyclerView()
        setupBottomNav()
        setupProfile()
        setupFab()
        requestLocation()
        loadPosts()
        startPolling()
    }

    private fun bindViews() {
        mapView      = findViewById(R.id.mapView)
        bottomNav    = findViewById(R.id.bottomNav)
        fabCompose   = findViewById(R.id.fabCompose)
        mapPanel     = findViewById(R.id.mapPanel)
        listPanel    = findViewById(R.id.listPanel)
        profilePanel = findViewById(R.id.profilePanel)
        rvPosts      = findViewById(R.id.rvPosts)
        tvEmptyList  = findViewById(R.id.tvEmptyList)
        progressBar  = findViewById(R.id.progressBar)
    }

    private fun setupMap() {
        mapView.setTileSource(TileSourceFactory.MAPNIK)
        mapView.setMultiTouchControls(true)
        mapView.controller.setZoom(13.0)
        mapView.controller.setCenter(CEBU)

        // Indigo/violet tint over OSM tiles to match the app theme
        // (parity with the web map: hue-rotate(210deg) saturate(0.85) brightness(0.98))
        applyMapTint()

        // My location button (FrameLayout container in the layout — cast to View)
        findViewById<View>(R.id.btnMyLocation).setOnClickListener {
            val loc = userLocation ?: CEBU
            mapView.controller.animateTo(loc)
        }
    }

    private fun applyMapTint() {
        // 1. Hue rotation by 210° (luminance-preserving rotation in RGB).
        val angle = Math.toRadians(210.0)
        val cos = Math.cos(angle).toFloat()
        val sin = Math.sin(angle).toFloat()
        val hueRotate = ColorMatrix(floatArrayOf(
            0.213f + cos * 0.787f - sin * 0.213f,
            0.715f - cos * 0.715f - sin * 0.715f,
            0.072f - cos * 0.072f + sin * 0.928f,
            0f, 0f,

            0.213f - cos * 0.213f + sin * 0.143f,
            0.715f + cos * 0.285f + sin * 0.140f,
            0.072f - cos * 0.072f - sin * 0.283f,
            0f, 0f,

            0.213f - cos * 0.213f - sin * 0.787f,
            0.715f - cos * 0.715f + sin * 0.715f,
            0.072f + cos * 0.928f + sin * 0.072f,
            0f, 0f,

            0f, 0f, 0f, 1f, 0f
        ))

        // 2. Saturation 0.85, brightness ~0.98
        val saturate = ColorMatrix().apply { setSaturation(0.85f) }
        val brightness = 0.98f
        val brightnessMx = ColorMatrix(floatArrayOf(
            brightness, 0f, 0f, 0f, 0f,
            0f, brightness, 0f, 0f, 0f,
            0f, 0f, brightness, 0f, 0f,
            0f, 0f, 0f, 1f, 0f
        ))

        // 3. Subtle violet overlay (matches the multiply-blend gradient on web).
        val violetOverlay = ColorMatrix(floatArrayOf(
            0.95f, 0f,    0f,    0f, 8f,
            0f,    0.92f, 0f,    0f, 0f,
            0f,    0f,    0.98f, 0f, 14f,
            0f,    0f,    0f,    1f, 0f
        ))

        val combined = ColorMatrix().apply {
            postConcat(hueRotate)
            postConcat(saturate)
            postConcat(brightnessMx)
            postConcat(violetOverlay)
        }

        mapView.overlayManager.tilesOverlay.setColorFilter(ColorMatrixColorFilter(combined))
    }

    private fun setupRecyclerView() {
        postsAdapter = PostsAdapter(
            posts = emptyList(),
            onItemClick = { post -> showPostDetail(post) },
            onUpvote    = { post -> handleVote(post, "UPVOTE") },
            onFlag      = { post -> handleFlag(post) }
        )
        rvPosts.adapter       = postsAdapter
        rvPosts.layoutManager = LinearLayoutManager(this)
    }

    private fun setupBottomNav() {
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_map     -> { showPanel(mapPanel);     fabCompose.show(); true }
                R.id.nav_words   -> { showPanel(listPanel);    fabCompose.hide(); true }
                R.id.nav_profile -> { showPanel(profilePanel); fabCompose.hide(); true }
                else -> false
            }
        }
        bottomNav.selectedItemId = R.id.nav_map
    }

    private fun setupProfile() {
        val tvName   = findViewById<TextView>(R.id.tvProfileName)
        val tvEmail  = findViewById<TextView>(R.id.tvProfileEmail)
        val tvAnon   = findViewById<TextView>(R.id.tvProfileAnon)
        val btnLogout = findViewById<Button>(R.id.btnLogout)

        tvName.text  = session.getUserName()
        tvEmail.text = session.getUserEmail()
        tvAnon.text  = buildAnonName(session.getUserId())

        btnLogout.setOnClickListener { logout() }
    }

    private fun setupFab() {
        fabCompose.setOnClickListener { showComposeDialog() }
    }

    private fun requestLocation() {
        fusedLocation = LocationServices.getFusedLocationProviderClient(this)
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), LOCATION_PERM)
            return
        }
        updateLocation()
    }

    private fun updateLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) return

        // Seed from the last known fix so the marker appears immediately if available.
        fusedLocation.lastLocation.addOnSuccessListener { loc ->
            if (loc != null) handleNewLocation(loc.latitude, loc.longitude, loc.accuracy)
        }

        // Then start live updates so the "you are here" dot tracks the user.
        if (locationCallback != null) return // already running
        val req = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5_000L)
            .setMinUpdateIntervalMillis(2_000L)
            .build()
        val cb = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val loc = result.lastLocation ?: return
                handleNewLocation(loc.latitude, loc.longitude, loc.accuracy)
            }
        }
        locationCallback = cb
        fusedLocation.requestLocationUpdates(req, cb, Looper.getMainLooper())
    }

    private fun handleNewLocation(lat: Double, lng: Double, accuracy: Float) {
        var pt = GeoPoint(lat, lng)
        // Guard against implausible fixes (e.g. an emulator's default Mountain View
        // GPS): if the reported location is far outside the Cebu region, snap the
        // marker and camera to Cebu so the app always presents a Cebu-centred map.
        if (pt.distanceToAsDouble(CEBU) > CEBU_REGION_RADIUS_M) {
            pt = CEBU
        }
        userLocation = pt
        updateUserMarker(pt)
        if (!hasFirstFix) {
            hasFirstFix = true
            mapView.controller.animateTo(pt)
            Toast.makeText(
                this,
                "Located you (±${accuracy.toInt()} m)",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    private fun updateUserMarker(point: GeoPoint) {
        val marker = userMarker ?: Marker(mapView).apply {
            setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_CENTER)
            icon = makeUserDot()
            setOnMarkerClickListener { _, _ -> true } // not interactive
            title = "You are here"
        }.also {
            userMarker = it
            mapView.overlays.add(it)
        }
        marker.position = point
        mapView.invalidate()
    }

    /** Draws a violet pulsing-style "you are here" dot to mirror the web marker. */
    private fun makeUserDot(): android.graphics.drawable.Drawable {
        val d = resources.displayMetrics.density
        val size = (44 * d).toInt()
        val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val cx = size / 2f
        val cy = size / 2f

        // Outer soft halo (matches .me-pulse on web)
        val halo = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.argb(70, 139, 92, 246) }
        canvas.drawCircle(cx, cy, size / 2.1f, halo)

        // Inner halo
        val halo2 = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.argb(120, 167, 139, 250) }
        canvas.drawCircle(cx, cy, size / 3.2f, halo2)

        // White ring (matches the 2px white border on web)
        val ringW = 3f * d
        val ringR = size / 5.0f
        val ring = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            style = Paint.Style.FILL
            color = Color.WHITE
        }
        canvas.drawCircle(cx, cy, ringR + ringW / 2f, ring)

        // Violet dot
        val dot = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            shader = RadialGradient(
                cx - ringR * 0.3f, cy - ringR * 0.3f, ringR,
                Color.rgb(167, 139, 250), Color.rgb(109, 40, 217), Shader.TileMode.CLAMP
            )
        }
        canvas.drawCircle(cx, cy, ringR, dot)

        return BitmapDrawable(resources, bmp)
    }

    override fun onRequestPermissionsResult(rc: Int, perms: Array<out String>, results: IntArray) {
        super.onRequestPermissionsResult(rc, perms, results)
        if (rc == LOCATION_PERM && results.isNotEmpty() &&
            results[0] == PackageManager.PERMISSION_GRANTED) {
            updateLocation()
        }
    }

    private fun loadPosts() {
        lifecycleScope.launch {
            progressBar.visibility = View.VISIBLE
            try {
                val resp = ApiClient.getService(session.getToken())
                    .getPosts(session.getUserId())
                if (resp.isSuccessful) {
                    posts = resp.body() ?: emptyList()
                    refreshUI()
                }
            } catch (e: Exception) {
                Toast.makeText(this@FeedActivity,
                    "Cannot reach server — check backend URL", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }

    private fun startPolling() {
        lifecycleScope.launch {
            while (isActive) {
                delay(30_000)
                try {
                    val resp = ApiClient.getService(session.getToken())
                        .getPosts(session.getUserId())
                    if (resp.isSuccessful) {
                        posts = resp.body() ?: emptyList()
                        refreshUI()
                    }
                } catch (_: Exception) {}
            }
        }
    }

    private fun refreshUI() {
        val visible = posts.filter { !it.isHidden }
        postsAdapter.updatePosts(visible)
        tvEmptyList.visibility = if (visible.isEmpty()) View.VISIBLE else View.GONE
        placeMapMarkers(visible)
    }

    private fun placeMapMarkers(visiblePosts: List<PostDto>) {
        mapView.overlays.clear()
        visiblePosts.forEach { post ->
            if (post.latitude == null || post.longitude == null) return@forEach
            val marker = Marker(mapView).apply {
                position = GeoPoint(post.latitude, post.longitude)
                setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                title    = post.anonName ?: buildAnonName(post.userId)
                snippet  = "♥ ${post.upvotes}  •  ${post.content.take(60)}"
                icon     = buildCountIcon(post.upvotes, post.upvotes > 5)
                setOnMarkerClickListener { _, _ -> showPostDetail(post); true }
            }
            mapView.overlays.add(marker)
        }
        // Re-attach the "you are here" marker on top of post markers after a clear.
        userMarker?.let { mapView.overlays.add(it) }
        mapView.invalidate()
    }

    private fun buildCountIcon(count: Int, hot: Boolean): android.graphics.drawable.Drawable {
        val size   = (40 * resources.displayMetrics.density).toInt()
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint  = Paint(Paint.ANTI_ALIAS_FLAG)
        paint.color = if (hot) Color.parseColor("#FF6B35") else Color.parseColor("#A084E8")
        canvas.drawCircle(size / 2f, size / 2f, size / 2f, paint)
        paint.color     = Color.WHITE
        paint.textSize  = size * 0.38f
        paint.textAlign = Paint.Align.CENTER
        val fm   = paint.fontMetrics
        val y    = size / 2f - (fm.descent + fm.ascent) / 2f
        canvas.drawText(count.toString(), size / 2f, y, paint)
        return android.graphics.drawable.BitmapDrawable(resources, bitmap)
    }

    // ── Vote ──────────────────────────────────────────────────────────────────

    private fun handleVote(post: PostDto, voteType: String) {
        lifecycleScope.launch {
            try {
                val req  = VoteRequest(session.getUserId(), voteType)
                val resp = ApiClient.getService(session.getToken()).vote(post.id, req)
                if (resp.isSuccessful) {
                    val updated = resp.body()!!
                    posts = posts.map { if (it.id == updated.id) updated else it }
                    refreshUI()
                }
            } catch (e: Exception) {
                Toast.makeText(this@FeedActivity, "Could not vote", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // ── Flag ──────────────────────────────────────────────────────────────────

    private fun handleFlag(post: PostDto) {
        if (post.userFlagged) return
        AlertDialog.Builder(this)
            .setTitle("Report Post")
            .setMessage("Report this post as inappropriate?")
            .setPositiveButton("Report") { _, _ ->
                lifecycleScope.launch {
                    try {
                        val req  = FlagRequest(session.getUserId())
                        val resp = ApiClient.getService(session.getToken()).flag(post.id, req)
                        if (resp.isSuccessful) {
                            val updated = resp.body()!!
                            posts = posts.map { if (it.id == updated.id) updated else it }
                            refreshUI()
                            Toast.makeText(this@FeedActivity, "Post reported", Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Toast.makeText(this@FeedActivity, "Could not report", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    // ── Post Detail ───────────────────────────────────────────────────────────

    private fun showPostDetail(post: PostDto) {
        val view = layoutInflater.inflate(R.layout.dialog_post_detail, null)
        view.findViewById<TextView>(R.id.tvDetailContent).text  = post.content
        view.findViewById<TextView>(R.id.tvDetailAnon).text     = post.anonName ?: buildAnonName(post.userId)
        view.findViewById<TextView>(R.id.tvDetailUpvotes).text  = "♥ ${post.upvotes}"
        view.findViewById<TextView>(R.id.tvDetailDownvotes).text = "▼ ${post.downvotes}"
        view.findViewById<TextView>(R.id.tvDetailFlags).text    = "⚑ ${post.flagCount}"

        val btnLove    = view.findViewById<Button>(R.id.btnDetailLove)
        val btnDislike = view.findViewById<Button>(R.id.btnDetailDislike)
        val btnReport  = view.findViewById<Button>(R.id.btnDetailReport)

        btnLove.text    = if (post.userVote == "UPVOTE") "♥ Loved" else "♡ Love"
        btnDislike.text = if (post.userVote == "DOWNVOTE") "▼ Disliked" else "▽ Dislike"
        btnReport.isEnabled = !post.userFlagged

        val dialog = AlertDialog.Builder(this, R.style.PostDetailDialog)
            .setView(view).create()

        btnLove.setOnClickListener    { dialog.dismiss(); handleVote(post, "UPVOTE") }
        btnDislike.setOnClickListener { dialog.dismiss(); handleVote(post, "DOWNVOTE") }
        btnReport.setOnClickListener  { dialog.dismiss(); handleFlag(post) }
        view.findViewById<ImageButton>(R.id.btnDetailClose).setOnClickListener { dialog.dismiss() }

        dialog.show()
    }

    // ── Compose ───────────────────────────────────────────────────────────────

    private fun showComposeDialog() {
        val loc = userLocation
        if (loc == null) {
            Toast.makeText(this, "Waiting for location…", Toast.LENGTH_SHORT).show()
            return
        }
        val view    = layoutInflater.inflate(R.layout.dialog_compose, null)
        val etText  = view.findViewById<EditText>(R.id.etComposeText)
        val tvCount = view.findViewById<TextView>(R.id.tvCharCount)
        val tvLoc   = view.findViewById<TextView>(R.id.tvComposeLoc)
        val tvErr   = view.findViewById<TextView>(R.id.tvComposeError)
        val btnPost = view.findViewById<Button>(R.id.btnComposePost)

        tvLoc.text = "📍 ${String.format("%.4f", loc.latitude)}, ${String.format("%.4f", loc.longitude)}"

        etText.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, b: Int, c: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                val len = s?.length ?: 0
                tvCount.text = "$len / 500"
                tvCount.setTextColor(getColor(if (len > 450) R.color.accent_purple else R.color.text_hint))
            }
        })

        val dialog = AlertDialog.Builder(this, R.style.PostDetailDialog)
            .setView(view).create()

        btnPost.setOnClickListener {
            val text = etText.text.toString().trim()
            if (text.isEmpty()) { tvErr.text = "Write something first"; tvErr.visibility = View.VISIBLE; return@setOnClickListener }
            if (text.length > 500) { tvErr.text = "Max 500 characters"; tvErr.visibility = View.VISIBLE; return@setOnClickListener }
            if (isToxic(text)) { tvErr.text = "Post blocked – inappropriate content"; tvErr.visibility = View.VISIBLE; return@setOnClickListener }
            tvErr.visibility = View.GONE
            btnPost.isEnabled = false
            lifecycleScope.launch {
                try {
                    val req  = CreatePostRequest(session.getUserId(), text, loc.latitude, loc.longitude)
                    val resp = ApiClient.getService(session.getToken()).createPost(req)
                    if (resp.isSuccessful) {
                        dialog.dismiss()
                        loadPosts()
                        Toast.makeText(this@FeedActivity, "Posted anonymously!", Toast.LENGTH_SHORT).show()
                    } else {
                        tvErr.text = "Post rejected by server"
                        tvErr.visibility = View.VISIBLE
                        btnPost.isEnabled = true
                    }
                } catch (e: Exception) {
                    tvErr.text = "Connection error"
                    tvErr.visibility = View.VISIBLE
                    btnPost.isEnabled = true
                }
            }
        }
        view.findViewById<ImageButton>(R.id.btnComposeClose).setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private val TOXIC = listOf("hate","kill","die","stupid","idiot","loser","ugly","worthless")
    private fun isToxic(text: String): Boolean {
        val lower = text.lowercase()
        return TOXIC.count { lower.contains(it) }.toDouble() / TOXIC.size >= 0.7
    }

    private val ADJ1 = listOf("Serene","Quiet","Gentle","Warm","Silent","Soft","Calm","Tender")
    private val ADJ2 = listOf("Sunset","Breeze","Dream","Rain","Moon","Mist","Star","Wave")
    private fun buildAnonName(uid: Long): String {
        val a1 = ADJ1[(uid % ADJ1.size).toInt()]
        val a2 = ADJ2[((uid / ADJ1.size) % ADJ2.size).toInt()]
        val n  = (uid * 137 + 500) % 1000
        return "ANON-$a1-$a2-$n"
    }

    private fun showPanel(panel: View) {
        listOf(mapPanel, listPanel, profilePanel).forEach { it.visibility = View.GONE }
        panel.visibility = View.VISIBLE
    }

    private fun logout() {
        session.clearSession()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    override fun onResume()  {
        super.onResume()
        mapView.onResume()
        // Resume live location updates when returning to the screen.
        if (locationCallback == null && session.isLoggedIn()) {
            updateLocation()
        }
    }
    override fun onPause()   {
        super.onPause()
        mapView.onPause()
        // Stop the location updates while paused to save battery.
        locationCallback?.let { fusedLocation.removeLocationUpdates(it) }
        locationCallback = null
    }
}
