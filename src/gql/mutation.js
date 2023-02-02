import { gql } from "@apollo/client";

export const CREATE_CLIENT_TOKEN = gql`
  mutation createClientToken($input: CreateClientTokenInput) {
    createClientToken(input: $input) {
      clientToken
    }
  }
`;

export const CREATE_NON_INSTANT_LOCAL_PAYMENT_CONTEXT = gql`
  mutation CreateNonInstantLocalPaymentContext(
    $input: CreateNonInstantLocalPaymentContextInput!
  ) {
    createNonInstantLocalPaymentContext(input: $input) {
      paymentContext {
        id
        type
        paymentId
        approvalUrl
        merchantAccountId
        createdAt
        transactedAt
        approvedAt
        amount {
          value
          currencyCode
        }
      }
    }
  }
`;

export const CHARGE = gql`
  mutation ChargePaymentMethod($input: ChargePaymentMethodInput!) {
    chargePaymentMethod(input: $input) {
      transaction {
        id
        legacyId
        amount {
          value
          currencyCode
        }
        status
      }
    }
  }
`;

export const AUTHORIZE = gql`
  mutation AuthorizePaymentMethod($input: AuthorizePaymentMethodInput!) {
    authorizePaymentMethod(input: $input) {
      transaction {
        id
        legacyId
        amount {
          value
          currencyCode
        }
        status
      }
    }
  }
`;
