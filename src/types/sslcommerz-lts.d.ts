declare module 'sslcommerz-lts' {
  interface SSLCzInitResponse {
    GatewayPageURL: string
    sessionkey: string
    [key: string]: any
  }

  interface SSLCzInitData {
    total_amount: number
    currency: string
    tran_id: string
    success_url: string
    fail_url: string
    cancel_url: string
    ipn_url?: string
    shipping_method: string
    product_name: string
    product_category: string
    product_profile: string
    cus_name: string
    cus_email: string
    cus_add1: string
    cus_city: string
    cus_country: string
    cus_phone: string
    ship_name: string
    ship_add1: string
    ship_city: string
    ship_country: string
    [key: string]: any
  }

  class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean)
    init(data: SSLCzInitData): Promise<SSLCzInitResponse>
    validate(params: { val_id: string }): Promise<any>
    transactionStatusQuery(params: { tran_id: string }): Promise<any>
  }

  export = SSLCommerzPayment
}
