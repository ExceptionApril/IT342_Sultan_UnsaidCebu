package com.example.mobileunsaidcebu

import org.junit.Test
import java.io.File
import org.junit.Assert.assertTrue

class VerticalSliceArchitectureTest {

    @Test
    fun verifyVerticalSliceStructure() {
        val rootPath = "src/main/java/com/example/mobileunsaidcebu"
        val featuresPath = "$rootPath/features"
        val corePath = "$rootPath/core"

        val authFeature = File("$featuresPath/auth")
        val mainFeature = File("$featuresPath/main")
        val coreConfig = File("$corePath/config")

        assertTrue("Auth feature slice should exist", authFeature.exists() && authFeature.isDirectory)
        assertTrue("Main feature slice should exist", mainFeature.exists() && mainFeature.isDirectory)
        assertTrue("Core config should exist", coreConfig.exists() && coreConfig.isDirectory)

        // Verify key files are in the right place
        assertTrue("LoginActivity should be in auth slice", File(authFeature, "LoginActivity.kt").exists())
        assertTrue("RegisterActivity should be in auth slice", File(authFeature, "RegisterActivity.kt").exists())
        assertTrue("MainActivity should be in main slice", File(mainFeature, "MainActivity.kt").exists())
        assertTrue("SupabaseConfig should be in core config", File(coreConfig, "SupabaseConfig.kt").exists())
    }
}
