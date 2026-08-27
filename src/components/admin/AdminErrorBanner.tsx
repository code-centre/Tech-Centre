interface AdminErrorBannerProps {
  message: string;
}

export default function AdminErrorBanner({ message }: AdminErrorBannerProps) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 dark:text-red-400">
      {message}
    </div>
  );
}
