import Net from "@rbxts/net";
import { ZirconPermissions } from "../Server/Class/ZirconGroup";
import { GetCommandService } from "../Services";

export default function createPermissionMiddleware(permission: keyof ZirconPermissions) {
	const permissionMiddleware: Net.Middleware = (next, event) => {
		const registry = GetCommandService("RegistryService");
		return (sender, ...args) => {
			const groups = registry.GetGroupsWithPermission(permission);
			const matchingGroup = groups.find((f) => f.HasMember(sender));
			if (matchingGroup !== undefined) {
				return next(sender, ...args);
			}
		};
	};
	return permissionMiddleware;
}
