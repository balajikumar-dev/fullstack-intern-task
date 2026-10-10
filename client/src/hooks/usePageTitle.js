import { useEffect } from 'react';
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Mini SaaS Template Store` : 'Mini SaaS Template Store';
  }, [title]);
}
