import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  DevSettings,
  BackHandler,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import Spinner from "react-native-loading-spinner-overlay";
import { Overlay } from "react-native-elements";
import { Audio } from "expo-av";

const jsCode =
  "document.getElementsByClassName('browser-message').forEach(function(e){e.style.cssText = 'display: none !important;'});";

const Error = ({ name }) => (
  <Overlay isVisible={true} fullScreen={true}>
    <View style={styles.container}>
      <Text style={styles.errorText}>
        You must be connected to the internet to use this app.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          DevSettings.reload();
        }}
      >
        <Text style={styles.retryButtonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  </Overlay>
);

export default function App() {
  const webViewRef = useRef(null);
  const webURL = "https://www.arsenal.com/";
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");

  const handleNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
  };

  useEffect(() => {
    async function permissionAsync() {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });
    }
    permissionAsync();
  }, []);

  useEffect(() => {
    const hardwareBackPressListener = () => {
      webViewRef.current.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      hardwareBackPressListener
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleLoadProgress = (event) => {
    const { nativeEvent } = event;
    if (nativeEvent.progress === 1) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (currentUrl === webURL) {
        Alert.alert("Hold up!", "Are you sure you want to exit the app?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "Yes", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      } else {
        webViewRef.current.goBack();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [currentUrl]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Spinner
          visible={isLoading}
          textStyle={styles.spinnerTextStyle}
          color="#3498db"
          overlayColor="#fff"
        />

        <WebView
          ref={webViewRef}
          source={{ uri: webURL }}
          style={styles.webView}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
          renderError={(errorName) => <Error name={errorName} />}
          allowsBackForwardNavigationGestures={true}
          scalesPageToFit={false}
          automaticallyAdjustContentInsets={false}
          onLoadProgress={handleLoadProgress}
          onNavigationStateChange={handleNavigationStateChange}
          injectedJavaScript={jsCode}
          injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
          injectedJavaScriptForMainFrameOnly={false}
          onMessage={() => {}}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  errorText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#3498db",
  },
  retryButton: {
    marginTop: 20,
    marginHorizontal: 50,
    backgroundColor: "#3498db",
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 5,
    padding: 10,
  },
  retryButtonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  spinnerTextStyle: {
    color: "#3498db",
  },
  webView: {
    flex: 1,
  },
});
