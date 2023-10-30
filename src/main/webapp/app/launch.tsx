import { useEffect } from 'react';
import axios from 'axios';

import './App.css';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { CLIENT_ID, REDIRECT_URI } from './constants';
import LoadingIndicator, { LoaderSize } from './components/loadingIndicator';

function Launch() {
  const url = useLocation();
  const urlParams = new URLSearchParams(url.search);

  const iss = urlParams.get('iss');
  localStorage.setItem('iss', iss); //Need to store iss in browser storage, so <Main /> can access it after redirect.

  const launchCode = urlParams.get('launch');

  //Retrieve the authorize URL and token endpoint
  useEffect(() => {
    const authenticate = async () => {
      const response = await axios.get(`${iss}/metadata`);
      const data = response.data;
      const urlInfo = data.rest[0].security.extension[0].extension;
      const metadata = { authUrl: urlInfo[0].valueUri, tokenUrl: urlInfo[1].valueUri };

      //Need to store token URL in browser storage, so <Main /> can request it after redirect.
      localStorage.setItem('tokenUrl', metadata.tokenUrl);

      //Authorize by redirecting to authorize URL, and append redirect_uri, client_id, launch code, and iss
      window.location.href = `${metadata.authUrl}?scope=launch&response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&launch=${launchCode}&state=98wrghuwuogerg97&aud=${iss}`;
    };

    if (iss) {
      authenticate().catch(console.error);
    }
  }, [iss]);

  return (
    <div className="App">
      <header className="App-header">
        <LoadingIndicator text="Authenticating" size={LoaderSize.LARGE} />
      </header>
    </div>
  );
}

export default Launch;
