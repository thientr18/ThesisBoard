import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const useUrlParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useState(new URLSearchParams(location.search));

  useEffect(() => {
    setParams(new URLSearchParams(location.search));
  }, [location.search]);

  const updateUrlParams = (newParams: Record<string, string | number | boolean>) => {
    const updatedParams = new URLSearchParams(params.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updatedParams.set(key, String(value));
      } else {
        updatedParams.delete(key);
      }
    });
    navigate({ search: updatedParams.toString() });
  };

  return { params, updateUrlParams };
};

export default useUrlParams;