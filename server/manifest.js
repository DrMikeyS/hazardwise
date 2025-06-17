const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "hazardwise/_app",
	assets: new Set([".nojekyll","favicon.ico","hazardwise_icon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DGCbNk1t.js",app:"_app/immutable/entry/app.BvIHVvvn.js",imports:["_app/immutable/entry/start.DGCbNk1t.js","_app/immutable/chunks/D869PeJ-.js","_app/immutable/chunks/BITUO3ds.js","_app/immutable/entry/app.BvIHVvvn.js","_app/immutable/chunks/BITUO3ds.js","_app/immutable/chunks/OzCop-J-.js","_app/immutable/chunks/Bgrwumxt.js","_app/immutable/chunks/CddoZiUs.js","_app/immutable/chunks/BH6CHFx5.js","_app/immutable/chunks/CQCJQAaV.js","_app/immutable/chunks/BxqH717Y.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BmoQjVDU.js')),
			__memo(() => import('./chunks/1-ClaWWL6d.js')),
			__memo(() => import('./chunks/2-B1qWrlDq.js')),
			__memo(() => import('./chunks/3-BI_J1q7l.js')),
			__memo(() => import('./chunks/4-Bx9FFJvb.js')),
			__memo(() => import('./chunks/5-Cpyk3CNS.js')),
			__memo(() => import('./chunks/6-BlwSHMxZ.js')),
			__memo(() => import('./chunks/7--XLwUyC2.js')),
			__memo(() => import('./chunks/8-BwzV4pl4.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/new",
				pattern: /^\/new\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/workspace",
				pattern: /^\/workspace\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/workspace/hazard",
				pattern: /^\/workspace\/hazard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/workspace/hazard/cause",
				pattern: /^\/workspace\/hazard\/cause\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/workspace/hazard/impact",
				pattern: /^\/workspace\/hazard\/impact\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/workspace/hazard/mitigation",
				pattern: /^\/workspace\/hazard\/mitigation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "/hazardwise";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
