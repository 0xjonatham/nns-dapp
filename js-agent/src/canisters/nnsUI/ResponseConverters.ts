import * as convert from "../converter";
import {
    CreateSubAccountResponse,
    GetAccountResponse,
    GetTransactionsResponse,
    HardwareWalletAccountDetails,
    RegisterHardwareWalletResponse,
    SubAccountDetails,
    Transaction,
    Transfer
} from "./model";
import {
    CreateSubAccountResponse as RawCreateSubAccountResponse,
    GetAccountResponse as RawGetAccountResponse,
    GetTransactionsResponse as RawGetTransactionsResponse,
    HardwareWalletAccountDetails as RawHardwareWalletAccountDetails,
    RegisterHardwareWalletResponse as RawRegisterHardwareWalletResponse,
    SubAccountDetails as RawSubAccountDetails,
    Transaction as RawTransaction,
    Transfer as RawTransfer
} from "./rawService";

export default class ResponseConverters {
    public toGetAccountResponse = (response: RawGetAccountResponse) : GetAccountResponse => {
        if ("Ok" in response) {
            return {
                Ok: {
                    accountIdentifier: response.Ok.account_identifier,
                    subAccounts: response.Ok.sub_accounts.map(this.toSubAccountDetails),
                    hardwareWalletAccounts: response.Ok.hardware_wallet_accounts.map(this.toHardwareWalletAccountDetails)
                }
            }
        }
        return response;
    }

    public toCreateSubAccountResponse = (response: RawCreateSubAccountResponse) : CreateSubAccountResponse => {
        if ("Ok" in response) {
            return {
                Ok: this.toSubAccountDetails(response.Ok)
            }
        }
        return response;
    }

    public toGetTransactionsResponse = (response: RawGetTransactionsResponse) : GetTransactionsResponse => {
        return {
            total: response.total,
            transactions: response.transactions.map(this.toTransaction)
        };
    }

    public toRegisterHardwareWalletResponse = (response: RawRegisterHardwareWalletResponse) : RegisterHardwareWalletResponse => {
        return response;
    }

    private toSubAccountDetails = (subAccount: RawSubAccountDetails) : SubAccountDetails => {
        return {
            id: convert.toSubAccountId(subAccount.sub_account),
            accountIdentifier: subAccount.account_identifier,
            name: subAccount.name,
        }
    }

    private toHardwareWalletAccountDetails = (hardwareWalletAccount: RawHardwareWalletAccountDetails) : HardwareWalletAccountDetails => {
        return {
            name: hardwareWalletAccount.name,
            accountIdentifier: hardwareWalletAccount.account_identifier
        };
    }

    private toTransaction = (transaction: RawTransaction) : Transaction => {
        return {
            timestamp: transaction.timestamp.timestamp_nanos,
            blockHeight: transaction.block_height,
            transfer: this.toTransfer(transaction.transfer)
        }
    }

    private toTransfer = (transfer: RawTransfer) : Transfer => {
        if ("Burn" in transfer) {
            return {
                Burn: {
                    amount: transfer.Burn.amount.e8s
                }
            };
        }
        if ("Mint" in transfer) {
            return {
                Mint: {
                    amount: transfer.Mint.amount.e8s
                }
            };
        }
        if ("Send" in transfer) {
            return {
                Send: {
                    to: transfer.Send.to,
                    amount: transfer.Send.amount.e8s,
                    fee: transfer.Send.fee.e8s
                }
            };
        }
        if ("Receive" in transfer) {
            return {
                Receive: {
                    from: transfer.Receive.from,
                    amount: transfer.Receive.amount.e8s,
                    fee: transfer.Receive.fee.e8s
                }
            };
        }
        throw new Error("Unrecognised transfer type - " + JSON.stringify(transfer));
    }
}
