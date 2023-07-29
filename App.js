import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  DevSettings,
  BackHandler,
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
        Morate imati pristup internetu kako bi koristili ovu aplikaciju.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          DevSettings.reload();
        }}
      >
        <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
      </TouchableOpacity>
    </View>
  </Overlay>
);

export default function App() {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

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
      return true; // Vraćamo true da sprečimo default handling
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      hardwareBackPressListener
    );

    return () => {
      backHandler.remove(); // Uklanjamo event listener kada komponenta bude unmount-ovana
    };
  }, []);

  const handleLoadProgress = (event) => {
    const { nativeEvent } = event;
    if (nativeEvent.progress === 1) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Spinner
          visible={isLoading}
          textStyle={styles.spinnerTextStyle}
          color="#92623c"
          overlayColor="#fff"
        />

        <WebView
          ref={webViewRef}
          source={{ uri: "https://www.youtube.com/" }}
          style={styles.webView}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
          renderError={(errorName) => <Error name={errorName} />}
          allowsBackForwardNavigationGestures={true}
          scalesPageToFit={false}
          automaticallyAdjustContentInsets={false}
          onLoadProgress={handleLoadProgress}
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
    color: "#92623c",
  },
  retryButton: {
    marginTop: 20,
    marginHorizontal: 50,
    backgroundColor: "#92623c",
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
    color: "#92623c",
  },
  webView: {
    flex: 1,
  },
});
