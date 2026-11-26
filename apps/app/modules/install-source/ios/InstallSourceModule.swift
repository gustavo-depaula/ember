import ExpoModulesCore

// TestFlight and the App Store install the same binary under the same
// provisioning, so expo-application calls both "App Store". Only the receipt
// tells them apart: a TestFlight install's is the sandbox receipt.
public class InstallSourceModule: Module {
  public func definition() -> ModuleDefinition {
    Name("InstallSource")

    Function("isTestFlight") { () -> Bool in
      Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
    }
  }
}
