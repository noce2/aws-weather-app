import { Bucket } from "@aws-cdk/aws-s3";
import { App, Construct, CustomResource, CustomResourceProps } from "@aws-cdk/core";
import { Provider } from "@aws-cdk/custom-resources";
import { WeatherAppCustomResourceProviderStack } from "./weather-app-custom-resource-provider-stack";

export interface WeatherAppCustomResourceProps {
    readonly addBucket: boolean;
    readonly deployLambdaAndGateway: boolean;
    readonly providerArnServiceToken: string;
}
export class WeatherAppCustomResource extends Construct {
    public readonly weatherAppUiSiteBucket: Bucket;
    public readonly underlyingCustomResource: CustomResource;
    constructor(scope: Construct, id: string, props: WeatherAppCustomResourceProps) {
        super(scope, id);

        this.underlyingCustomResource = new CustomResource(this, 'WeatherAppCustomResource', {
            serviceToken: props.providerArnServiceToken
        })
    }
}