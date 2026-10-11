import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import vm from "node:vm";

// Render the actual navigation, routes and page guards without a browser or API.
const frontend = resolve(fileURLToPath(new URL("../../artifacts/pratibimba/", import.meta.url)));
const requireFrontend = createRequire(`${frontend}/package.json`);
const ts = requireFrontend("typescript");
const React = requireFrontend("react");
const { renderToStaticMarkup } = requireFrontend("react-dom/server");
const managementPaths = ["/prakalpa-management", "/user-management", "/role-access"];
const load = (file, role, pathname = "/dashboard", cache = new Map()) => {
  const filename = resolve(frontend, "src", file);
  if (cache.has(filename)) return cache.get(filename);
  const source = readFileSync(filename, "utf8").replaceAll("import.meta.env.BASE_URL", '"/"');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }, fileName: filename }).outputText;
  const context = {
    currentUser: { id: role, role, name: "Test User", email: "test@example.test" },
    notifications: [], refreshLiveData: async () => {},
  };
  const exports = {}; cache.set(filename, exports);
  const localRequire = name => {
    if (name.endsWith("app-context")) return { useApp: () => context, AppProvider: ({ children }) => children };
    if (name === "wouter") return {
      useLocation: () => [pathname, () => {}],
      Router: ({ children }) => children,
      Switch: ({ children }) => React.Children.toArray(children).find(child => child.props.path === pathname || !child.props.path),
      Route: ({ children }) => children,
      Redirect: () => null,
      Link: ({ children, href, ...props }) => React.createElement("a", { href, ...props }, children),
    };
    if (name.includes("/services/")) return {};
    if (name.endsWith(".jpeg")) return { default: "/logo.jpeg", __esModule: true };
    if (name.endsWith("account-center")) return { AccountCenter: () => null };
    if (name.includes("/pages/") && !/\/(user-management|prakalpa-management|role-access)$/.test(name)) {
      return { default: () => React.createElement("div", null, name), __esModule: true };
    }
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/") ? resolve(frontend, "src", name.slice(2)) : resolve(dirname(filename), name);
      const target = [base + ".tsx", base + ".ts"].find(candidate => {
        try { readFileSync(candidate); return true; } catch { return false; }
      });
      if (!target) throw new Error(`Missing frontend module: ${name}`);
      return load(target.slice(`${frontend}/src/`.length), role, pathname, cache);
    }
    return requireFrontend(name);
  };
  vm.runInNewContext(compiled, { exports, require: localRequire, console }, { filename });
  return exports;
};
const render = (file, name, role, path) => renderToStaticMarkup(React.createElement(load(file, role, path)[name]));

test("desktop and mobile navigation hide management from Admin while retaining audit navigation", () => {
  for (const [file, component] of [["components/side-nav.tsx", "SideNav"], ["components/top-nav.tsx", "TopNav"]]) {
    // Mobile menu starts closed. Inspect its actual role arrays in addition to desktop rendering.
    const source = readFileSync(`${frontend}/src/${file}`, "utf8");
    for (const path of managementPaths) {
      const escaped = path.replaceAll("/", "\\/");
      const match = source.match(new RegExp(`href: "${escaped}"[\\s\\S]*?roles: (\\[[^\\]]*\\])`));
      assert.ok(match, `${file}: ${path}`);
      assert.deepEqual(JSON.parse(match[1]), ["super_admin"]);
    }
    const admin = render(file, component, "admin");
    if (component === "SideNav") {
      for (const path of managementPaths) assert.equal(admin.includes(`href="${path}"`), false);
      for (const path of ["/audit-plan", "/scheduled-audits", "/all-reports"]) assert.ok(admin.includes(`href="${path}"`));
      const superadmin = render(file, component, "super_admin");
      for (const path of managementPaths) assert.ok(superadmin.includes(`href="${path}"`));
    }
  }
});

test("direct frontend management routes reject Admin and all operational roles", () => {
  for (const role of ["admin", "auditor", "audit_coordinator", "prakalpa_manager"]) {
    for (const path of managementPaths) {
      const markup = render("App.tsx", "default", role, path);
      assert.ok(markup.includes("Access Restricted"), `${role}: ${path}`);
    }
  }
  for (const path of managementPaths) {
    const markup = render("App.tsx", "default", "super_admin", path);
    assert.equal(markup.includes("Access Restricted"), false, path);
  }
});

test("management page controls independently deny Admin", () => {
  for (const file of ["user-management", "prakalpa-management", "role-access"]) {
    const markup = render(`pages/${file}.tsx`, "default", "admin");
    assert.match(markup, /Only [Ss]uperadmins can manage/);
  }
});

test("Admin and Superadmin retain audit routes without inheriting operational impersonation", () => {
  const { isRoleAllowed } = load("components/role-route-guard.tsx", "admin");
  for (const role of ["admin", "super_admin"]) {
    for (const path of ["/audit-plan", "/scheduled-audits", "/all-reports", "/audit-calendar"]) {
      assert.equal(render("App.tsx", "default", role, path).includes("Access Restricted"), false);
    }
  }
  assert.equal(isRoleAllowed("super_admin", ["admin"]), true);
  assert.equal(isRoleAllowed("super_admin", ["auditor"]), false);
  assert.equal(isRoleAllowed("super_admin", ["audit_coordinator"]), false);
});
