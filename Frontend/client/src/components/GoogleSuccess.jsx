import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRedirectForRole, persistAuthSession } from '../roleUtils';


function GoogleSuccess() {
  const navigate = useNavigate();


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role') || 'customer';

    if (token) {
      persistAuthSession(token, role);
      navigate(getRedirectForRole(role), { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <p>Logging in...</p>;
}


export default GoogleSuccess;