module.exports = function(arn, eventType){
    return {
        "LambdaFunctionARN": arn,
        "EventType": eventType
    }
}
