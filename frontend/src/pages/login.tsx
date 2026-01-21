export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Single Sign-On через корпоративных провайдеров.</p>
        <div className="mt-6 space-y-3">
          <button className="btn-primary w-full">Sign in with Google</button>
          <button className="btn-secondary w-full">Sign in with Microsoft</button>
          <button className="btn-secondary w-full">Sign in with Okta</button>
          <button className="btn-secondary w-full">Sign in with JINR OIDC</button>
        </div>
      </div>
    </div>
  );
}
