"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "@/lib/utils"

function Collapsible({
  className,
  ...props
}) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn("t-acc", className)} {...props} />;
}

function CollapsibleTrigger({
  ...props
}) {
  return (<CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />);
}

function CollapsibleContent({
  className,
  children,
  ...props
}) {
  return (
    <CollapsiblePrimitive.Panel 
      data-slot="collapsible-content" 
      className={cn("overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down", className)} 
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
