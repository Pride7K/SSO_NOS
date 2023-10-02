import React, { useEffect, useState } from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query'
import axios from "axios"
import { generateCodeChallengeFromVerifier, generateCodeVerifier } from "../utilities/TokenGenerationUtils";
import { saveObjectToLocalStorage } from "../utilities/LocalStorageUtils";
import {
    Card,
    Button,
    List,
    ListItem,
    Typography,
    CardFooter,
    ListItemSuffix,
    CardBody,
    CardHeader,
    IconButton,
    Checkbox
} from "@material-tailwind/react";
import 'tailwindcss/tailwind.css';
import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const userManagerSettings: UserManagerSettings = {
    authority: 'https://tyr-test.apigee.net/oauth2/v3-0/staging',
    client_id: 'qMzputtvAabtuS4yseAHuNOW9O3GGMA3',
    redirect_uri: 'http://localhost:5173/userDetails',
    post_logout_redirect_uri: 'http://localhost:5173/userDetails',

    response_type: 'code',
    scope: 'openid profile email api',
};

interface IUserDetails {

}

const UserDetails = () => {
    const [externalPopup, setExternalPopup] = useState<Window | null>(null);
    const [codeVerifier, setCodeVerifier] = useState(generateCodeVerifier());


    const userManager = new UserManager(userManagerSettings);

    async function getToken(codeParam: string) {
        var result = await axios.post("https://tyr-test.apigee.net/oauth2/v3-0/staging/token", {
            "client_id": "qMzputtvAabtuS4yseAHuNOW9O3GGMA3",
            "code": codeParam,
            "redirect_uri": "http://localhost:5173",
            "code_verifier": codeVerifier,
            "grant_type": "authorization_code"
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })


        mutation.mutate({ code: codeParam, access_token: result.data.access_token, id_token: result.data.id_token } as any);


    }


    async function getPersonalInfo() {
        var userDataJSON = localStorage.getItem("user")
        if (userDataJSON) {
            // Se os dados existirem no localStorage
            const userData = JSON.parse(userDataJSON);
            if (!userData.userInfo) {
                const config = {
                    headers: { Authorization: `Bearer ${userData.access_token}` }
                };
                axios.get("https://tyr-test.apigee.net/nosid/qc-staging/api/v1/personal-info", config).then((result) => {
                    userData.userInfo = result.data;
                    mutation.mutate(userData);
                }).catch((error) => {
                    localStorage.removeItem("user")
                })
            }
            return userData;
        }
        else {
            return "";
        }
    }


    const queryClient = useQueryClient()

    // Queries
    const query = useQuery({ queryKey: ['codes'], queryFn: getPersonalInfo })

    console.log(query.data?.userInfo)

    const mutation = useMutation(async (userData: any) => {
        await new Promise<void>((resolve) => {
            saveObjectToLocalStorage("user", userData);
            resolve();
        });
    }, {
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(['codes']);
        },
    });

    useEffect(() => {
        if (!externalPopup) {
            return;
        }
        const timer = setInterval(async () => {
            if (!externalPopup) {
                timer && clearInterval(timer);
                return;
            }
            const currentUrl = externalPopup.location.href;
            if (!currentUrl) {
                return;
            }
            const searchParams = new URL(currentUrl).searchParams;
            const code = searchParams.get('code');
            if (code) {
                externalPopup.close();
                clearInterval(timer);
                await getToken(code);
            }
        }, 500)
    },
        [externalPopup]
    )

    useEffect(() => {
        userManager.signinRedirectCallback().then((user) => {
            console.log('Usuário autenticado:', user);
            mutation.mutate({ ...user });
        }).catch((error) => {
            console.error('Erro ao autenticar o usuário:', error);
        });
    })

    const openModalSSONOS = async () => {
        var code_challenge = await generateCodeChallengeFromVerifier(codeVerifier);

        var width = 600;
        var height = 500;
        var left = window.screenX + (window.outerWidth - width) / 2;
        var top = window.screenY + (window.outerHeight - height) / 2.5;
        var title = `Title`;
        var url = `https://tyr-test.apigee.net/oauth2/v3-0/staging/authorize?client_id=qMzputtvAabtuS4yseAHuNOW9O3GGMA3&redirect_uri=http://localhost:5173&response_type=code&scope=openid%20profile%20email%20api&state=3eb06491053c4384a068b2e46cb4d54abb&code_challenge=${code_challenge}&code_challenge_method=S256&response_mode=query`;
        const popup = window.open(url, title, `width=${width},height=${height},left=${left},top=${top}`);

        setExternalPopup(popup);
    }

    function openModalSSONOS_OIDC() {
        userManager.signinRedirect();
    }


    function logoutUser() {
        localStorage.removeItem("user")
        queryClient.invalidateQueries(['codes']);
    }

    return (
        <div className="flex items-center justify-center">
            {query.data?.userInfo ? (
                <>
                    <Card className="mt-6 w-96">
                        <CardBody>
                            <Typography variant="h5" color="blue-gray" className="mb-2">
                                {query.data.userInfo.DisplayName}
                            </Typography>
                            <Checkbox label="Tem proteçao de dois fatores" checked={query.data.userInfo.TwoFactorAuthEnabled} disabled={true} />
                            <Checkbox label="Serviço de TV" checked={query.data.userInfo.HasTvService} disabled={true} />
                            <Typography className="mt-5" color="blue-gray">
                                Utilizadores
                            </Typography>
                            <List>
                                {query.data.userInfo.UsernameAliases.map((user) =>
                                    <ListItem ripple={false} className="py-1 pr-1 pl-4">
                                        {user.Username + " " + user.Type}
                                    </ListItem>
                                )}
                            </List>
                        </CardBody>
                        <CardFooter className="pt-0 mt-10">
                            <Button color="red" onClick={() => logoutUser()} variant="gradient" fullWidth>
                                Logout
                            </Button>
                        </CardFooter>
                    </Card>
                </>
            ) :
                (<Card className="w-96 pb-100 mt-20">
                    <CardHeader
                        variant="gradient"
                        color="gray"
                        className="mb-4 grid h-28 place-items-center mt-1"
                    >
                        <Typography variant="h3" color="white">
                            Sign In
                        </Typography>
                    </CardHeader>
                    <CardFooter className="pt-0 mt-10">
                        <Button onClick={() => openModalSSONOS_OIDC()} variant="gradient" fullWidth>
                            Sign In With NOSID
                        </Button>
                    </CardFooter>
                </Card>)}
        </div>
    )
}

export default UserDetails;