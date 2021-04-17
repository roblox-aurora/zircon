import Net from "@rbxts/net";
import { ZirconLogLevel } from "Client/Types";
import Zircon from "index";
import { ZirconPermissions } from "../Server/Class/ZirconGroup";
import { GetCommandService } from "../Services";

export default function createPermissionMiddleware(permission: keyof ZirconPermissions) {
	const permissionMiddleware: Net.Middleware = (nxt, event) => {
		const registry = GetCommandService("RegistryService");
		const log = GetCommandService("LogService");
		return (sender, ...args) => {
			const groups = registry.GetGroupsWithPermission(permission);
			const matchingGroup = groups.find((f) => f.HasMember(sender));

			if (matchingGroup !== undefined) {
				return nxt(sender, ...args);
			} else {
				log.Write(ZirconLogLevel.Error, "NetPermissionMiddleware", `Request to {} by user {} denied.`, {
					Variables: [event.GetInstance().Name, sender],
				});
				warn(`[Zircon] Request to '${event.GetInstance().GetFullName()}' by user '${sender}' denied.`);
			}
		};
	};
	return permissionMiddleware;
}
