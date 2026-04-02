let app;
let importError;

try {
    const mod = await import('../server.js');
    app = mod.default;
} catch (err) {
    importError = err;
    console.error('[api/index.js] FATAL: Failed to import server.js:', err.message, err.stack);
}

export default function handler(req, res) {
    if (importError) {
        res.status(500).json({
            error: 'Server module failed to load',
            message: importError.message,
            stack: importError.stack?.split('\n').slice(0, 10)
        });
        return;
    }
    return app(req, res);
}
