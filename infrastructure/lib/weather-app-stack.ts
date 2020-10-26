import { App, CfnOutput, Stack, StackProps } from "@aws-cdk/core"
import { WeatherAppCustomResource } from "./weather-app-custom-resource";

export class WeatherAppStack extends Stack {
    public readonly weatherAppSiteCfnOutput: CfnOutput

    constructor(app: App, id: string, props?: StackProps) {
        super(app, id, props);
    
        const weatherAppSiteCfnOutput = new CfnOutput(this, 'apiurl', {
          exportName: 'WeatherAppApiUrl',
          value: 'esperate, ya voy'
        })

        const weatherAppCustomResource = new WeatherAppCustomResource(this, 'WeatherAppCustomResource', {
          addBucket: false,
          deployLambdaAndGateway: false
        });
        this.weatherAppSiteCfnOutput = weatherAppSiteCfnOutput;
      }
}