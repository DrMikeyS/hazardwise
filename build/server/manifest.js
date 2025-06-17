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
		client: {start:"_app/immutable/entry/start.GIDA4MuG.js",app:"_app/immutable/entry/app.BKrhnHN0.js",imports:["_app/immutable/entry/start.GIDA4MuG.js","_app/immutable/chunks/ChRNjCm_.js","_app/immutable/chunks/BITUO3ds.js","_app/immutable/entry/app.BKrhnHN0.js","_app/immutable/chunks/BITUO3ds.js","_app/immutable/chunks/OzCop-J-.js","_app/immutable/chunks/Bgrwumxt.js","_app/immutable/chunks/CddoZiUs.js","_app/immutable/chunks/BH6CHFx5.js","_app/immutable/chunks/CQCJQAaV.js","_app/immutable/chunks/BxqH717Y.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BIbeZvpk.js')),
			__memo(() => import('./chunks/1-CCW7aSn4.js')),
			__memo(() => import('./chunks/2-91wVgygH.js')),
			__memo(() => import('./chunks/3-DiZl5rEx.js')),
			__memo(() => import('./chunks/4-cbGxusg3.js')),
			__memo(() => import('./chunks/5-BozibwSg.js')),
			__memo(() => import('./chunks/6-CEZ--Z5i.js')),
			__memo(() => import('./chunks/7-Cbtjt1CB.js')),
			__memo(() => import('./chunks/8-DRwJprA4.js'))
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
