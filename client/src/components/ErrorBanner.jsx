function ErrorBanner({ message, onDismiss }) {
    if (!message) return null;

    return (
        <div className="error-banner" role="alert">
            <span>{message}</span>
            <button className="banner-close" onClick={onDismiss} aria-label="Dismiss error">
                ×
            </button>
        </div>
    );
}

export default ErrorBanner;