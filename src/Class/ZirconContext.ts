import { LogEvent, LogLevel } from "@rbxts/log";
import { MessageTemplateParser, PropertyToken } from "@rbxts/message-templates";
import { DestructureMode, TemplateTokenKind } from "@rbxts/message-templates/out/MessageTemplateToken";
import ZrContext from "@rbxts/zirconium/out/Data/Context";
import { RbxSerializer } from "@rbxts/message-templates/out/RbxSerializer";
import { ZirconFunction } from "./ZirconFunction";
import { RunService } from "@rbxts/services";
import { ZrInputStream, ZrOutputStream } from "@rbxts/zirconium/out/Data/Stream";

export interface ReadonlyZirconContext {
	GetExecutor(): Player;
	GetFunctionName(): string;
}

export interface ZirconBeforeContext extends ReadonlyZirconContext {
	GetInput(): ZrInputStream;
}
export interface ZirconAfterContext extends ReadonlyZirconContext {
	GetInput(): ZrInputStream;
	GetOutput(): ZrOutputStream;
	GetLogs(): ReadonlyArray<LogEvent>;
}

export class ZirconContext implements ReadonlyZirconContext, ZirconBeforeContext, ZirconAfterContext {
	private logs = new Array<LogEvent>();

	constructor(private innerContext: ZrContext, private executingFunction: ZirconFunction<any, any>) {}
	public GetExecutor() {
		const executor = this.innerContext.getExecutor();
		assert(executor);
		return executor;
	}

	/**
	 * Writes a log response to the executing player
	 * @param level The log level
	 * @param template The template string
	 * @param args The arguments to the template string
	 */
	private Log(level: LogLevel, template: string, ...args: unknown[]) {
		if (RunService.IsServer()) {
			import("../Services/LogService").then((log) => {
				const message: Writable<LogEvent> = {
					Level: level,
					SourceContext: `(function '${this.executingFunction.GetName()}')`,
					Template: template,
					Timestamp: DateTime.now().ToIsoDate(),
					LogToPlayer: this.GetExecutor(),
				};

				const tokens = MessageTemplateParser.GetTokens(template);
				const propertyTokens = tokens.filter((t): t is PropertyToken => t.kind === TemplateTokenKind.Property);

				let idx = 0;
				for (const token of propertyTokens) {
					const arg = args[idx++];

					if (idx <= args.size()) {
						if (arg !== undefined) {
							if (token.destructureMode === DestructureMode.ToString) {
								message[token.propertyName] = tostring(arg);
							} else {
								message[token.propertyName] = typeIs(arg, "table") ? arg : RbxSerializer.Serialize(arg);
							}
						}
					}
				}

				log.ZirconLogService.WriteStructured(message);
				this.logs.push(message);
			});
		} else {
			import("../Client/index").then(({ default: client }) => {
				const log: LogEvent = {
					Level: level,
					SourceContext: `(function '${this.executingFunction.GetName()}')`,
					Template: template,
					Timestamp: DateTime.now().ToIsoDate(),
					LogToPlayer: this.GetExecutor(),
				};
				client.StructuredLog(log);
				this.logs.push(log);
			});
		}
	}

	/**
	 * Logs an information message to the calling player
	 * @param template The template string
	 * @param args The template string args
	 */
	public LogInfo(template: string, ...args: unknown[]) {
		this.Log(LogLevel.Information, template, ...args);
	}

	/**
	 * Logs a warning message to the calling player
	 * @param template The template string
	 * @param args The template string args
	 */
	public LogWarning(template: string, ...args: unknown[]) {
		this.Log(LogLevel.Warning, template, ...args);
	}

	/**
	 * Logs an error message to the calling player
	 * @param template The template string
	 * @param args The template string args
	 */
	public LogError(template: string, ...args: unknown[]) {
		this.Log(LogLevel.Error, template, ...args);
	}

	public GetLogs(): ReadonlyArray<LogEvent> {
		return this.logs;
	}

	/**
	 * Gets the output stream for the `|` pipe operator
	 * @returns The output stream
	 */
	public GetOutput() {
		return this.innerContext.getOutput();
	}

	/**
	 * Gets the input stream for the `|` pipe operator
	 * @returns The input stream
	 */
	public GetInput() {
		return this.innerContext.getInput();
	}

	/**
	 * Gets the name of the calling function
	 * @returns The name of the calling function
	 */
	public GetFunctionName() {
		return this.executingFunction.GetName();
	}
}
