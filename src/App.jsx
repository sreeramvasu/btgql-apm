import { useEffect, useState } from 'react'
import './App.css'
import { Container, MenuItem, FormControl, TextField, Button, Stack } from '@mui/material';
import { TRANSACTION_SEARCH } from './gql/query';
import { useLazyQuery } from '@apollo/client';

import LPM from './LPM';


function App() {
  const [APM, setAPM] = useState("alipay");
  const [amount, setAmount] = useState(1);
  const [currency, setCurrency] = useState("SGD");
  const [country, setCountry] = useState("SG");
  const [nonInstant, setNonInstant] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [MAID, setMAID] = useState('SG_STORE');
  const [result, setResult] = useState(null);
  const [localPaymentContext, setLocalPaymentContext] = useState(null);
  const [polling, setPolling] = useState(false);


  useEffect(() => {
    //update MAID when currency changes
    setMAID(CurrencyDictionary[currency])
  }, [currency])

  const handleAPMChange = (e) => {
    console.log(`APM: ${e.target.value}`);
    setAPM(e.target.value);
    prePopulateNonInstantFields(e.target.value);
  };

  const APMDictionary = {
    "alipay": "Alipay",
    "bancontact": "Bancontact",
    "blik": "Blik",
    "boletobancario": "Boleto Bancário (non-instant)",
    "eps": "EPS",
    "giropay": "Giropay",
    "grabpay": "Grabpay",
    "ideal": "iDeal",
    "mybank": "MyBank",
    "multibanco": "Multibanco (non-instant)",
    "oxxo": "Oxxo (non-instant)",
    "p24": "P24",
    "satispay": "Satispay",
    "sofort": "Sofort",
    "trustly": "Trustly",
    "wechatpay": "Wechatpay"
  }

  const handleCurrencyChange = (e) => {
    console.log(`Currency code: ${e.target.value}`);
    setCurrency(e.target.value);
  };

  const handleAmountChange = (e) => {
    console.log(`Amount: ${e.target.value}`);
    setAmount(e.target.value);
  }

  const CurrencyDictionary = {
    "SGD": "SG_STORE",
    "AUD": "AU_STORE",
    "BRL": "BR_STORE",
    "EUR": "EU_STORE",
    "GBP": "GB_STORE",
    "PLN": "PL_STORE",
    "MXN": "MX_STORE",
    "USD": "US_STORE",
    "DKK": "DK_STORE"
  };

  const handleCountryChange = (e) => {
    console.log(`Country code: ${e.target.value}`);
    setCountry(e.target.value);
  }

  const CountryDictionary = {
    "AT": "Austria",
    "AU": "Australia",
    "BE": "Belgium",
    "BR": "Brazil",
    "DE": "Germany",
    "DK": "Denmark",
    "ES": "Spain",
    "GB": "United Kingdom",
    "IT": "Italy",
    "MX": "Mexico",
    "NL": "The Netherlands",
    "PL": "Poland",
    "PT": "Portugal",
    "SG": "Singapore"
  }

  const defaultSettings = (countryVal, currencyVal, nonInstant) => {
    console.log(countryVal)
    setCountry(countryVal);
    setCurrency(currencyVal);
    setNonInstant(nonInstant);

  }

  const prePopulateNonInstantFields = (APMVal) => {
    switch (APMVal) {
      case 'alipay':
        defaultSettings("SG", "SGD", false)
        break;
      case 'bancontact':
        defaultSettings("BE", "EUR", false)
        break;
      case 'blik':
        defaultSettings("PL", "PLN", false)
        break;
      case 'boletobancario':
        defaultSettings("BR", "BRL", true)
        break;
      case 'eps':
        defaultSettings("AT", "EUR", false)
        break;
      case 'giropay':
        defaultSettings("DE", "EUR", false)
        break;
      case 'ideal':
        defaultSettings("NL", "EUR", false)
        break;
      case 'multibanco':
        defaultSettings("PT", "EUR", true)
        break;
      case 'mybank':
        defaultSettings("IT", "EUR", false)
        break;
      case 'oxxo':
        defaultSettings("MX", "MXN", true)
        break;
      case 'p24':
        defaultSettings("PL", "EUR", false)
        break;
      case 'payu':
        defaultSettings("CZ", "CZK", false)
        break;
      case 'poli':
        defaultSettings("AU", "AUD", false)
        break;
      case 'safetypay':
        defaultSettings("NL", "EUR", false)
        break;
      case 'satispay':
        defaultSettings("IT", "EUR", false)
        break;
      case 'sofort':
        defaultSettings("NL", "EUR", false)
        break;
      case 'trustly':
        defaultSettings("DK", "DKK", false)
        break;
      case 'trustpay':
        defaultSettings("CZ", "CZK", false)
        break;
      case 'verkkopankki':
        defaultSettings("FI", "EUR", false)
        break;
      case 'wechatpay':
        defaultSettings("SG", "USD", false)
        break;
      case 'grabpay':
        defaultSettings("SG", "SGD", false)
        break;
      default:
        defaultSettings("", "", false)
    }
  }

  const getURLParam=()=> {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has("token")) {
        setPolling(true);
        let pollTime = localStorage.getItem("CreatedTime");
        let pmtContext = JSON.parse(localStorage.getItem("localPaymentContext"));
        setLocalPaymentContext(JSON.stringify(pmtContext,null,2))
        pollOrderStatus(pollTime);
    }
}

const pollOrderStatus = (pollTime) =>{
    console.log("Polling for: "+ pollTime)
    pollingOrder({
        variables: {
          "input": {
            "createdAt": {
              "greaterThanOrEqualTo": pollTime
            }
          }
        },
    })
}

useEffect(()=>{
    getURLParam();
},[])

const [pollingOrder] = useLazyQuery(
  TRANSACTION_SEARCH,
  {
    pollInterval: 5000,
    onCompleted: (data) => {
      console.log(data);
      if(data.search.transactions.edges[0]){
          setResult(data.search.transactions.edges[0]);
          alert("Webhook received!");
          return;
      }
    },
    onError: (error) => {
      console.log(error);
      alert(error);
    }
  }
);

  const reset = () =>{
    window.location = window.location.pathname;
  }

  return (
    <Container maxWidth="false">
      <h2>Braintree GraphQL APM</h2>
      {result ?
      <>
        <pre style={{ textAlign: "left" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
        <Button variant="outlined" onClick={reset}><b>Start Over</b></Button>
        </> : polling ? <>
          <p>Waiting for webhook to confirm order...</p>
<pre style={{textAlign:"left"}}>{localPaymentContext}</pre>
        </>:
        <Stack direction="column" spacing={2} justifyContent="center">
          <FormControl>
            <Stack direction="row" spacing={2} justifyContent="center">
              <TextField
                fullWidth
                select
                label="Payment method"
                value={APM}
                onChange={handleAPMChange}
                variant="outlined"
                disabled={submitClicked}
              >
                {
                  Object.keys(APMDictionary).map((APM, index) => {
                    return <MenuItem key={index} value={APM}>{APMDictionary[APM]}</MenuItem>
                  })
                }
              </TextField>
              <TextField
                fullWidth
                id="amount"
                type="number"
                label="Amount"
                variant="outlined"
                value={amount}
                onChange={handleAmountChange}
                disabled={submitClicked}
              />
            </Stack>
            <Stack my={2} direction="row" spacing={2} justifyContent="center">
              <TextField
                label="Currency"
                fullWidth
                select
                variant="outlined"
                value={currency}
                onChange={handleCurrencyChange}
                disabled={submitClicked}
              >
                {
                  Object.keys(CurrencyDictionary).map((currency, index) => {
                    return <MenuItem key={index} value={currency}>{currency}</MenuItem>
                  })
                }
              </TextField>
              <TextField
                label="Country"
                variant="outlined"
                fullWidth
                select
                value={country}
                onChange={handleCountryChange}
                disabled={submitClicked}
              >
                {
                  Object.keys(CountryDictionary).map((country, index) => {
                    return <MenuItem key={index} value={country}>{CountryDictionary[country]}</MenuItem>
                  })
                }
              </TextField>
            </Stack>
          </FormControl>
          <LPM
            setResult={setResult}
            MAID={MAID}
            amount={amount}
            APM={APM}
            currency={currency}
            country={country}
            submitClicked={submitClicked}
            setSubmitClicked={setSubmitClicked}
            nonInstant={nonInstant} />
        </Stack>
      }

    </Container>
  );
}

export default App
