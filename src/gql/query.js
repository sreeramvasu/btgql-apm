import { gql } from "@apollo/client";

export const GET_LOCAL_PAYMENT_CONTEXT = gql`
  query Node($id: ID!) {
    node(id: $id) {
      ... on LocalPaymentContext {
        id
        legacyId
        type
        amount {
          value
          currencyIsoCode
        }
        approvalUrl
        merchantAccountId
        transactedAt
        approvedAt
        createdAt
        updatedAt
        expiredAt
        paymentId
        orderId
      }
    }
  }
`;

export const ID_FROM_LEGACY = gql`
  query idFromLegacyId($legacyId: ID!, $legacyIdType: LegacyIdType!) {
    idFromLegacyId(legacyId: $legacyId, type: $legacyIdType)
  }
`;

export const TRANSACTION_SEARCH = gql`
query TransactionSearch($input: TransactionSearchInput!) {
  search{
    transactions (input: $input){
      edges{
        node{
          id
          legacyId
          amount{
            value
            currencyCode
          }
          status
        }
      }
    }
  }
}
`;

