module.exports = function(pathPattern){
    return {
        "PathPattern": pathPattern,
        "TargetOriginId": "Custom-awly-awly.io.s3-website.us-east-1.amazonaws.com",
        "ForwardedValues": {
            "QueryString": true,
            "Cookies": {
                "Forward": "all"
            },
            "Headers": {
                "Quantity": 0,
                "Items": []
            },
            "QueryStringCacheKeys": {
                "Quantity": 0,
                "Items": []
            }
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0,
            "Items": []
        },
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "AllowedMethods": {
            "Quantity": 7,
            "Items": [
                "HEAD",
                "DELETE",
                "POST",
                "GET",
                "OPTIONS",
                "PUT",
                "PATCH"
            ],
            "CachedMethods": {
                "Quantity": 2,
                "Items": [
                    "HEAD",
                    "GET"
                ]
            }
        },
        "SmoothStreaming": false,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true,
        "LambdaFunctionAssociations": {
            "Quantity": 0,
            "Items": []
        }
    }
}
