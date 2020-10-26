import { App, CfnOutput, Stack, StackProps } from "@aws-cdk/core"

export class WeatherAppStack extends Stack {
    public readonly weatherAppSiteCfnOutput: CfnOutput

    constructor(app: App, id: string, props?: StackProps) {
        super(app, id, props);
    
        const weatherAppSiteCfnOutput = new CfnOutput(this, 'apiurl', {
          exportName: 'WeatherAppApiUrl',
          value: 'espérate, ya voy'
        })
        this.weatherAppSiteCfnOutput = weatherAppSiteCfnOutput;
      }
}