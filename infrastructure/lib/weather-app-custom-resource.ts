import { Bucket } from "@aws-cdk/aws-s3";
import { App, Construct, CustomResource, CustomResourceProps } from "@aws-cdk/core";
import { Provider } from "@aws-cdk/custom-resources";
import { WeatherAppCustomResourceProviderStack } from "./weather-app-custom-resource-provider-stack";

export interface WeatherAppCustomResourceProps {
    readonly addBucket: boolean;
    readonly deployLambdaAndGateway: boolean;
}
export class WeatherAppCustomResource extends Construct {
    public readonly weatherAppUiSiteBucket: Bucket;
    public readonly underlyingCustomResource: CustomResource;
    constructor(scope: Construct, id: string, props: WeatherAppCustomResourceProps) {
        super(scope, id);

        console.log(JSON.stringify(scope.node.root.node.uniqueId))
        const provider = ((scope.node.root.node.findChild(
            WeatherAppCustomResourceProviderStack.name) as WeatherAppCustomResourceProviderStack)
            .provider)
        this.underlyingCustomResource = new CustomResource(this, 'WeatherAppCustomResource', {
            serviceToken: 'arn:aws:lambda:eu-west-2:892799438830:function:WeatherAppCustomResourceP-WeatherAppCustomResource-ACS0N55V7N2F'
        })
    }
}