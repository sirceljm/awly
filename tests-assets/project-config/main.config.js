module.exports = {
    DYNAMODB_PORT: 8500,
    DYNAMODB_ADMIN_PORT: 8501,
    HTTPS_PORT: 8443,
    HTTP_PORT: 8080,

    redirect_from_http: false, // only usefull if working with ports 80 and 443

    aws_region: "us-east-1",
    credentials_path: "",

    domain: "",
    s3_bucket: "",
    s3_assets_folder: "assets",

    /* CloudFront */
    cf_distribution_id: "",
    cf_certificate_arn: "",
    cf_caller_reference: "",
    cf_comment:"awly.io - Awly",

    /* API Gateway */
    api_gateway_id: "",
    api_gateway_prod_name: "",

    /* Lambda */
    lambda_role_arn: "arn:aws:iam::237297460428:role/awly-lambda",
    lambda_role_arn_edge: "",

    /* Assets */
    // assets_mapping:
};
