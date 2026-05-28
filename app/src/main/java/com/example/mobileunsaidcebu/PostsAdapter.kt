package com.example.mobileunsaidcebu

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.*

class PostsAdapter(
    private var posts: List<PostDto>,
    private val onItemClick: (PostDto) -> Unit,
    private val onUpvote: (PostDto) -> Unit,
    private val onFlag: (PostDto) -> Unit
) : RecyclerView.Adapter<PostsAdapter.PostViewHolder>() {

    private val ADJ1 = listOf("Serene","Quiet","Gentle","Warm","Silent","Soft","Calm","Tender")
    private val ADJ2 = listOf("Sunset","Breeze","Dream","Rain","Moon","Mist","Star","Wave")

    private fun anonName(userId: Long): String {
        val a1 = ADJ1[(userId % ADJ1.size).toInt()]
        val a2 = ADJ2[((userId / ADJ1.size) % ADJ2.size).toInt()]
        val num = (userId * 137 + 500) % 1000
        return "ANON-$a1-$a2-$num"
    }

    private fun formatDate(ts: String?): String {
        if (ts == null) return ""
        return try {
            val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val date = sdf.parse(ts.take(19)) ?: return ""
            SimpleDateFormat("dd MMMM yyyy", Locale.getDefault()).format(date)
        } catch (e: Exception) { "" }
    }

    inner class PostViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvContent:   TextView = view.findViewById(R.id.tvPostContent)
        val tvAnonName:  TextView = view.findViewById(R.id.tvAnonName)
        val tvDate:      TextView = view.findViewById(R.id.tvPostDate)
        val tvUpvotes:   TextView = view.findViewById(R.id.tvUpvotes)
        val tvFlags:     TextView = view.findViewById(R.id.tvFlags)
        val btnUpvote:   Button   = view.findViewById(R.id.btnUpvote)
        val btnFlag:     Button   = view.findViewById(R.id.btnFlag)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PostViewHolder =
        PostViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_post, parent, false))

    override fun onBindViewHolder(holder: PostViewHolder, position: Int) {
        val post = posts[position]
        holder.tvContent.text  = post.content
        holder.tvAnonName.text = post.anonName ?: anonName(post.userId)
        holder.tvDate.text     = formatDate(post.createdAt)
        holder.tvUpvotes.text  = "${post.upvotes} ♥"
        holder.tvFlags.text    = "${post.flagCount} ⚑"

        holder.btnUpvote.text = if (post.userVote == "UPVOTE") "♥ Loved" else "♡ Love"
        holder.btnFlag.isEnabled   = !post.userFlagged
        holder.btnFlag.alpha = if (post.userFlagged) 0.4f else 1f

        holder.itemView.setOnClickListener { onItemClick(post) }
        holder.btnUpvote.setOnClickListener { onUpvote(post) }
        holder.btnFlag.setOnClickListener   { onFlag(post) }
    }

    override fun getItemCount(): Int = posts.size

    fun updatePosts(newPosts: List<PostDto>) {
        posts = newPosts
        notifyDataSetChanged()
    }
}
