import UIKit
import Capacitor

// The app uses the UIScene lifecycle (required from iOS 27): the window, URL
// opens and universal links live in SceneDelegate. UIKit no longer calls the
// app delegate's window/foreground/background/open-URL methods once a scene
// manifest is present, so they aren't implemented here.
@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

}
