export const LogoIcon = ({ className, ...props }) => (
	<img src="/logo.svg" alt="Soseki Logo Icon" width="24" height="24" className={`size-6 ${className || ''}`} {...props} />
);

export const Logo = ({ className, ...props }) => (
	<img src="/logo.svg" alt="Soseki Logo" width="100" height="24" className={`h-6 w-auto ${className || ''}`} {...props} />
);
