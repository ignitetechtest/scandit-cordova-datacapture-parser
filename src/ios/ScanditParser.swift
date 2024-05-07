import ScanditParser
import ScanditFrameworksCore
import ScanditFrameworksParser

struct ParserCommandArgument: CommandJSONArgument {
    let id: String
    let data: String
}

@objc(ScanditParser)
public class ScanditParser: CDVPlugin {
    var parserModule: ParserModule!

    override public func pluginInitialize() {
        super.pluginInitialize()
        parserModule = ParserModule()
        parserModule.didStart()
    }

    public override func dispose() {
        parserModule.didStop()
        super.dispose()
    }

    @objc(getDefaults:)
    func getDefaults(command: CDVInvokedUrlCommand) {
        commandDelegate.send(.success(message: [:]), callbackId: command.callbackId)
    }

    @objc(parseString:)
    func parseString(command: CDVInvokedUrlCommand) {
        guard let commandArgument = try? ParserCommandArgument.fromCommand(command) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        parserModule.parse(string: commandArgument.data,
                           id: commandArgument.id,
                           result: CordovaResult(commandDelegate, command.callbackId)
        )
    }

    @objc(parseRawData:)
    func parseRawData(command: CDVInvokedUrlCommand) {
        guard let commandArgument = try? ParserCommandArgument.fromCommand(command) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        parserModule.parse(data: commandArgument.data,
                           id: commandArgument.id,
                           result: CordovaResult(commandDelegate, command.callbackId)
        )
    }
    
    @objc(createUpdateNativeInstance:)
    func createUpdateNativeInstance(command: CDVInvokedUrlCommand) {
        guard let parserJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        parserModule.createOrUpdateParser(parserJson: parserJson, result: CordovaResult(commandDelegate, command.callbackId))
    }
    
    @objc(disposeParser:)
    func disposeParser(command: CDVInvokedUrlCommand) {
        guard let parserId = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        parserModule.disposeParser(parserId: parserId, result: CordovaResult(commandDelegate, command.callbackId))
    }
}
