"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[671],{9881:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return s},contentTitle:function(){return l},metadata:function(){return c},toc:function(){return u},default:function(){return p}});var i=t(7462),r=t(3366),o=(t(7294),t(3905)),a=["components"],s={sidebar_position:1},l="Introduction",c={unversionedId:"intro",id:"intro",isDocsHomePage:!1,title:"Introduction",description:"Zircon is an advanced debugging console for Roblox games, built with TypeScript.",source:"@site/docs/intro.md",sourceDirName:".",slug:"/intro",permalink:"/docs/intro",editUrl:"https://github.com/roblox-aurora/zircon/edit/main/docs/docs/intro.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",next:{title:"Installing for TypeScript",permalink:"/docs/tutorial-basics/install"}},u=[{value:"Features",id:"features",children:[]},{value:"Registering and using Zircon Commands",id:"registering-and-using-zircon-commands",children:[]}],g={toc:u};function p(e){var n=e.components,t=(0,r.Z)(e,a);return(0,o.kt)("wrapper",(0,i.Z)({},g,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"introduction"},"Introduction"),(0,o.kt)("div",{align:"center"},(0,o.kt)("img",{src:"/img/logo.svg",width:"250px"})),(0,o.kt)("p",null,"Zircon is an advanced debugging console for Roblox games, built with ",(0,o.kt)("a",{parentName:"p",href:"https://roblox-ts.com"},"TypeScript"),"."),(0,o.kt)("h2",{id:"features"},"Features"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("h3",{parentName:"li",id:"zirconium-language-scripting"},"Zirconium Language Scripting"),(0,o.kt)("p",{parentName:"li"},"  Zircon comes inbuilt with a runtime scripting language called ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/roblox-aurora/zirconium"},"Zirconium"),". This allows you to run scripts against your game during runtime."),(0,o.kt)("p",{parentName:"li"},"  More information on how to set this up, will come when Zircon is closer to being production-ready."),(0,o.kt)("p",{parentName:"li"},"  Supports:"),(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"Functions","  Using ",(0,o.kt)("inlineCode",{parentName:"li"},"ZirconServer.Registry.RegisterFunction")," +  ",(0,o.kt)("inlineCode",{parentName:"li"},"ZirconFunctionBuilder")),(0,o.kt)("li",{parentName:"ul"},"Namespaces","  Using ",(0,o.kt)("inlineCode",{parentName:"li"},"ZirconServer.Registry.RegisterNamespace")," + ",(0,o.kt)("inlineCode",{parentName:"li"},"ZirconNamespaceBuilder")),(0,o.kt)("li",{parentName:"ul"},"Enums","  Using ",(0,o.kt)("inlineCode",{parentName:"li"},"ZirconServer.Registry.RegisterEnum")," + ",(0,o.kt)("inlineCode",{parentName:"li"},"ZirconEnumBuilder")))),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("h3",{parentName:"li",id:"structured-logging"},"Structured Logging"),(0,o.kt)("p",{parentName:"li"},"  If you want logging for Zircon, you will need to install ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/roblox-aurora/rbx-log"},"@rbxts/log"),"."),(0,o.kt)("p",{parentName:"li"},"  Then to use Zircon with Log, you simply do "),(0,o.kt)("pre",{parentName:"li"},(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import Log from "@rbxts/log";\nimport Log, { Logger } from "@rbxts/log";\nimport Zircon from "@rbxts/zircon";\n\nLog.SetLogger(\n    Logger.configure()\n        // ... Any other configurations/enrichers go here.\n        .WriteTo(Zircon.Log.Console()) // This will emit any `Log` messages to the Zircon console\n        .Create() // Creates the logger from the configuration\n);\n')),(0,o.kt)("p",{parentName:"li"},"  This will need to be done on both the ",(0,o.kt)("em",{parentName:"p"},"client")," and ",(0,o.kt)("em",{parentName:"p"},"server")," to achieve full logging."),(0,o.kt)("p",{parentName:"li"},"  All logging done through this can be filtered through the console itself. That's the power of structured logging! ;-)"))),(0,o.kt)("h2",{id:"registering-and-using-zircon-commands"},"Registering and using Zircon Commands"),(0,o.kt)("p",null,"Below is an example of how to register a command in Zircon:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-ts"},'import { ZirconServer, ZirconFunctionBuilder } from "@rbxts/zircon";\nimport Log from "@rbxts/log";\n\nZirconServer.Registry.RegisterFunction(\n    new ZirconFunctionBuilder("print_message")\n        .AddArguments("string")\n        .Bind((context, message) => Log.Info(\n                "Zircon says {Message} from {Player}", \n                message,\n                context.GetExecutor()\n        )),\n    [ZirconServer.Registry.User]\n)\n')),(0,o.kt)("p",null,"This will create a global ",(0,o.kt)("inlineCode",{parentName:"p"},"print_message")," that all players can run."),(0,o.kt)("p",null,"Then if run in Zircon:"),(0,o.kt)("img",{src:"/img/Example1.png"}),(0,o.kt)("p",null,"The first argument of ",(0,o.kt)("inlineCode",{parentName:"p"},"RegisterFunction")," takes a ",(0,o.kt)("inlineCode",{parentName:"p"},"ZirconFunctionBuilder")," - which is the easiest way to build a function. ",(0,o.kt)("inlineCode",{parentName:"p"},"AddArguments")," takes any number of arguments for types you want, in built types in Zircon you can use a string for. Otherwise you supply the type validator object."))}p.isMDXComponent=!0}}]);