
import { useState, useEffect } from 'react'
import { Button, Stack } from '@mui/material';
import './App.css'
import { CHARGE, CREATE_CLIENT_TOKEN, CREATE_NON_INSTANT_LOCAL_PAYMENT_CONTEXT} from './gql/mutation';
import { useMutation } from '@apollo/client';


import.meta.glob("./assets/images, true, /\.(png)$/");

function getImgUrl(fileName) {
    return new URL(`./assets/images/${fileName}.png`, import.meta.url).href;
}


export default function LPM({ APM, amount, currency, country, submitClicked, setSubmitClicked, nonInstant, MAID, setResult }) {
    const [LPMInstance, setLPMInstance] = useState();
    const [nonce, setNonce] = useState("");

    //*******GraphQL functions*********//
    const [createClientToken] = useMutation(CREATE_CLIENT_TOKEN, {
        onCompleted: (data) => {
            console.log(data);
            loadLPMs(data.createClientToken.clientToken);
        },
        onError: (err) => {
            console.log(err);
        }
    })

    const [chargePaymentMethod] = useMutation(CHARGE, {
        onCompleted: (data) => {
            alert("Payment Successful");
            console.log(data);
            setNonce("");
            setResult(data);
        },
        onError: (err) => {
            console.log(err);
        }
    })
    //***************************//

    useEffect(() => {
        console.log(`Merchant Account ID: ${MAID}`);
        createClientToken({
            variables: {
                input: {
                    clientToken: {
                        merchantAccountId: MAID
                    }
                }
            }
        });
    }, [MAID])

    const [loadNonInstantLPMs] = useMutation(CREATE_NON_INSTANT_LOCAL_PAYMENT_CONTEXT, {
        onCompleted: (data) => {
            let approvalUrl = data.createNonInstantLocalPaymentContext.paymentContext.approvalUrl;
            console.log(JSON.stringify(data,null,2));
            localStorage.setItem("localPaymentContext", JSON.stringify(data,null,2));
            localStorage.setItem("CreatedTime", data.createNonInstantLocalPaymentContext.paymentContext.createdAt);
            console.log(`approval URL : ${approvalUrl}`);
            alert("Payment Successful for the APM method, redirecting to approval URL");
            window.location.href = approvalUrl;
        },
        onError: (err) => {
            console.log(err);
            alert("An error occured during the processing");
            setResult(err);
        }
    });

    const loadLPMs = (token) => {
        braintree.client.create(
            {
                authorization: token,
            },
            function (clientErr, clientInstance) {
                if (clientErr) {
                    console.error("Error creating client:", clientErr);
                    return;
                }
                braintree.localPayment.create(
                    {
                        client: clientInstance,
                        merchantAccountId: MAID,
                    },
                    function (localPaymentErr, localPaymentInstance) {
                        if (localPaymentErr) {
                            console.error(
                                "Error creating local payment component:",
                                localPaymentErr
                            );
                            return;
                        }
                        setLPMInstance(localPaymentInstance);
                        console.log("local payment instance initialized");
                    }
                );
            }
        );
    }

    const handleSubmit = () => {
        console.log(`Submitted Details: {
          Payment Method: ${APM},
          Amount: ${amount},
          Currency Code: ${currency},
          Country Code: ${country},
          MAID: ${MAID}
        }`);
        if (amount < 1) return alert("Invalid amount entered")

        setSubmitClicked(true);

        //check if APM is instant or non-instant, in case of non instant, directly call the payment context and process the payment
        if (!nonInstant) {
            processPayment(LPMInstance);
        } else {
            createAndCaptureNonInstantPayment(APM);
        }
    }

    const processPayment = (localPaymentInstance, e) => {
        console.log(`paymentType: ${APM},
        countryCode: ${country},
        givenName: "John",
        surname: "Doe",
        email: "john.doe@example.com",
        address: {
            countryCode: ${country},
        },
        fallback: {
            buttonText: "Return to Checkout Page",
            url: "https://example.com/my-checkout-page",
        },
        amount: ${amount},
        currencyCode: ${currency},`)
        localPaymentInstance.startPayment(
            {
                paymentType: APM,
                countryCode: country,
                givenName: "John",
                surname: "Doe",
                email: "john.doe@example.com",
                address: {
                    countryCode: country,
                },
                fallback: {
                    buttonText: "Return to Checkout Page",
                    url: "https://example.com/my-checkout-page",
                },
                amount: amount,
                currencyCode: currency,
                onPaymentStart: function (data, continueCallback) {
                    // store data.paymentID for webhook
                    console.log(data);
                    continueCallback();
                },
            },
            function (startPaymentErr, payload) {
                if (startPaymentErr) {
                    console.log(startPaymentErr);
                    if (startPaymentErr.type !== "CUSTOMER") {
                        console.error("Error starting payment:", startPaymentErr);
                    }
                    return;
                }
                //submit nonce to server
                console.log(payload.nonce);
                setNonce(payload.nonce);
            }
        );
    }

    const createAndCaptureNonInstantPayment = (APM) => {
        // Getting the data for all the needed fields for payment
        let paymentContext = {
            amount: {
                value: amount,
                currencyCode: currency
            },
            type: APM.toUpperCase(),
            countryCode: country,
            returnUrl: `http://localhost:${import.meta.env.VITE_PORT}`,
            cancelUrl: `http://localhost:${import.meta.env.VITE_PORT}`,
            merchantAccountId: MAID
        };

        let payerInfo = {
            givenName: "John",
            surname: "Doe"
        };

        if(APM == 'boletobancario') {
            payerInfo.email = "john.doe@paypal.com",
            payerInfo.taxInfo = {
                identifier: "06661359000196",
                type: "BR_CNPJ"
            };
            payerInfo.billingAddress = {};
            payerInfo.shippingAddress = {};
            payerInfo.shippingAddress = {
                streetAddress: "Rua Major Cândido 311",
                extendedAddress: "456",
                locality: "Barreiras",
                region: "Bahia",
                postalCode: "47807-075",
                countryCode: "BR"
            };
            payerInfo.billingAddress = {
                streetAddress: "Rua Major Cândido 311",
                extendedAddress: "456",
                locality: "Barreiras",
                region: "Bahia",
                postalCode: "47807-075",
                countryCode: "BR"
            };
            paymentContext.payerInfo = payerInfo;

        } else if(APM == 'multibanco') {
            paymentContext.payerInfo = payerInfo;

        } else if(APM == 'oxxo') {
            payerInfo.email = "john.doe@example.com",
            payerInfo.billingAddress = {};
            payerInfo.shippingAddress = {};
            payerInfo.billingAddress = {
                streetAddress: "NIGROMANTE 729",
                extendedAddress: "Centro",
                locality: "Guanajuato",
                region: "Irapuato",
                postalCode: "36500",
                countryCode: "MX"
            };
            payerInfo.shippingAddress = {
                streetAddress: "NIGROMANTE 729",
                extendedAddress: "Centro",
                locality: "Guanajuato",
                region: "Irapuato",
                postalCode: "36500",
                countryCode: "MX"
            };
            paymentContext.payerInfo = payerInfo;
        }

        console.log(`data: ${JSON.stringify(paymentContext, null, 2)}`);
        loadNonInstantLPMs({
            variables: {
                input: {
                    paymentContext: paymentContext
                }
            }
        });
    }

    const handlePayment = () => {
        chargePaymentMethod({
            variables: {
                input: {
                    paymentMethodId: nonce,
                    transaction: {
                        amount: amount,
                        merchantAccountId: MAID
                    }
                }
            }
        })
    }

    return (
        <>
            <Button
                variant="outlined"
                onClick={handleSubmit}
                sx={{ display: submitClicked && 'none' }}
            ><img style={{ width: "120px" }} src={getImgUrl(APM)}
                /></Button>
            {nonce && <Stack><p><b>Nonce for {APM}</b>: <i>{nonce}</i></p><Button
                variant="outlined"
                onClick={handlePayment}
            ><b>Checkout</b></Button></Stack>}
        </>
    )
}

