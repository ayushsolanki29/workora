export const LogoIcon = ({ className, ...props }) => (
	<img src="/logo.svg" alt="Soseki Logo Icon" className={`size-6 ${className || ''}`} {...props} />
);

export const Logo = ({ className, ...props }) => (
	<img src="/logo.svg" alt="Soseki Logo" className={`h-6 w-auto ${className || ''}`} {...props} />
);
