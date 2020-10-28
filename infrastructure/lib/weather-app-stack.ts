import { App, CfnOutput, Stack, StackProps } from "@aws-cdk/core"
import { Provider } from "@aws-cdk/custom-resources";
import { WeatherAppCustomResource } from "./weather-app-custom-resource";

export interface WeatherAppStackProps extends StackProps {
    customResourceProviderArn: string
}
export class WeatherAppStack extends Stack {
    public readonly weatherAppSiteCfnOutput: CfnOutput

    constructor(app: App, id: string, props: WeatherAppStackProps) {
        super(app, id, props);
    
        const weatherAppSiteCfnOutput = new CfnOutput(this, 'apiurl', {
          exportName: 'WeatherAppApiUrl',
          value: 'esperate, ya voy'
        })

        const weatherAppCustomResource = new WeatherAppCustomResource(this, 'WeatherAppCustomResource', {
          addBucket: false,
          deployLambdaAndGateway: false,
          providerArnServiceToken: props.customResourceProviderArn,
          branchToTrackForAppSource: 'test-branch-2'
        });
        this.weatherAppSiteCfnOutput = weatherAppSiteCfnOutput;
      }
}