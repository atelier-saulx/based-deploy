# Based.io Deploy

Deploy your branch easily in your Based.io account using this GitHub Action.

## Inputs

### `userID`

**Required** The user ID created on the Based.io dashboard.

### `apiKey`

**Required** The secret token for authentication with the Based.io API.

### `size`

**Not Required** The size of the environment, can be 'small' or 'large'. The default is 'small'.

### `region`

**Not Required** In which region would you like to spawn the environment? You can choose between 'eu-central-1', 'sa-east-1', 'us-east-1', 'us-west-1', 'ap-southeast-2'. The default is 'eu-central-1'.

## Outputs

### `response`

A Success/Error message containing the Based CLI output. 

## Example usage
* Login into your account at Based.io dashboard.
Image
* Go to 'Settings'.
Image
* Click on your organization's name and then click on 'Service accounts'. After click on 'Create new service account'.
Image
* Give a name to your service account and select a role to your project. You can choose between 'admin' and 'viewer' and then click on 'Create service account'.
Image
* You'll see your User ID and the API key. Pay attention you can only see this information once, so click on both to copy to your clipboard and store safely this information and then click on Exit.
Image
* Your dashboard will update with your new service account created. Now you can use this action passing the information to the workflow.

```yaml
uses: atelier-saulx/basedio-deploy@v1
with:
  userID: ${{ secrets.BASED_USER_ID }}
  apiKey: ${{ secrets.BASED_API_KEY }}
  size: 'small'
  region: 'eu-central-1'
