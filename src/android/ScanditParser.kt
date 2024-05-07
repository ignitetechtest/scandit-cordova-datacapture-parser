/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2020- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.parser

import com.scandit.datacapture.cordova.core.ScanditCaptureCore
import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.cordova.core.utils.PluginMethod
import com.scandit.datacapture.cordova.core.utils.defaultArgumentAsString
import com.scandit.datacapture.frameworks.parser.ParserModule
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.json.JSONArray
import java.lang.reflect.Method

class ScanditParser : CordovaPlugin() {

    private val parserModule = ParserModule()

    private lateinit var exposedFunctionsToJs: Map<String, Method>

    override fun pluginInitialize() {
        super.pluginInitialize()
        ScanditCaptureCore.addPlugin(serviceName)
        parserModule.onCreate(cordova.context)

        // Init functions exposed to JS
        exposedFunctionsToJs =
            this.javaClass.methods.filter { it.getAnnotation(PluginMethod::class.java) != null }
                .associateBy { it.name }
    }

    override fun onReset() {
        parserModule.onDestroy()
        pluginInitialize()
    }

    override fun onDestroy() {
        parserModule.onDestroy()
        super.onDestroy()
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        return if (exposedFunctionsToJs.contains(action)) {
            exposedFunctionsToJs[action]?.invoke(this, args, callbackContext)
            true
        } else {
            false
        }
    }

    @PluginMethod
    fun getDefaults(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        callbackContext.success()
    }

    @PluginMethod
    fun parseString(args: JSONArray, callbackContext: CallbackContext) {
        parserModule.parseString(
            args.getJSONObject(0).toString(),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun parseRawData(args: JSONArray, callbackContext: CallbackContext) {
        parserModule.parseRawData(
            args.getJSONObject(0).toString(),
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun disposeParser(args: JSONArray, callbackContext: CallbackContext) {
        parserModule.disposeParser(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun createUpdateNativeInstance(args: JSONArray, callbackContext: CallbackContext) {
        parserModule.createOrUpdateParser(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }
}
