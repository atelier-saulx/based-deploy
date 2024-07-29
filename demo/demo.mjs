import {BasedClient} from "@based/client";

const demo = async () => {
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2UwMjg5NDczIiwidHlwZSI6ImFwaUtleSIsImlhdCI6MTcyMTc0NDk1OX0.K_-TccMQHxRU9i9I-JXFhdIV1PeVNu8bcPBmyWJP_pY"
    const userID = "use0289473"

    const client = new BasedClient({
        org: 'saulx',
        project: 'based-cloud',
        env: 'platform',
        name: '@based/admin-hub',
    })

    console.log('✅ Based Client created')

    const auth = await client.setAuthState({
        token: apiKey,
        type: 'serviceAccount',
        // userId: userID,
    })

    console.log('✅ Based AuthState set', auth)

    await client.call('create-env', {
        org: "github-actions",
        project: "demo",
        env: "test",
        config: 'small',
        region: 'eu-central-1',
    })
}

demo()