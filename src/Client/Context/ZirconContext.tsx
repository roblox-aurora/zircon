import Roact from "@rbxts/roact";
import { ZirconClientDispatchService } from "../../Services/ClientDispatchService";
import { ZirconClientRegistryService } from "../../Services/ClientRegistryService";
import { ZirconClient } from "../../index";

interface Contexts {
	_zrso4dispatcher: ZirconClientDispatchService;
	_zrso4registry: ZirconClientRegistryService;
}

class ZirconProvider extends Roact.Component {
	private __addContext!: <TKey extends keyof Contexts>(
		this: ZirconProvider,
		key: TKey,
		value: Contexts[TKey],
	) => void;

	public constructor(props: {}) {
		super(props);
		this.__addContext("_zrso4dispatcher", ZirconClient.Dispatch);
		this.__addContext("_zrso4registry", ZirconClient.Registry);
	}

	public render() {
		return <Roact.Fragment>{this.props[Roact.Children]}</Roact.Fragment>;
	}
}

interface ZirconConsumerProps {
	render: (dispatcher: ZirconClientDispatchService) => Roact.Element | undefined;
}
class ZirconConsumer extends Roact.Component<ZirconConsumerProps> {
	private __getContext!: <TKey extends keyof Contexts>(this: ZirconConsumer, key: TKey) => Contexts[TKey];
	private dispatcher: ZirconClientDispatchService;
	private registry: ZirconClientRegistryService;
	public constructor(props: ZirconConsumerProps) {
		super(props);
		this.dispatcher = this.__getContext("_zrso4dispatcher");
		this.registry = this.__getContext("_zrso4registry");
	}
	public render() {
		return <Roact.Fragment>{this.props.render(this.dispatcher)}</Roact.Fragment>;
	}
}

namespace ZirconContext {
	export const Provider = ZirconProvider;
	export const Consumer = ZirconConsumer;
}

export default ZirconContext;
