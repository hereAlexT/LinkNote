import { IonContent, IonHeader, IonInput, IonPage, IonText, IonTitle, IonToolbar, IonButton, IonGrid, IonCol, IonRow, IonButtons, IonMenuButton } from '@ionic/react';
import { useState } from 'react';
import { Signup as HandleSignup, Login as HanldeLogin } from '../apis/AuthenticationAPI';
import { Redirect} from 'react-router';
import { useHistory } from "react-router-dom";

const Signup: React.FC = () => {


    /* Email Validation */
    const [isTouched, setIsTouched] = useState(false);
    const [isValid, setIsValid] = useState<boolean>();

    const validateEmail = (email: string) => {
        return email.match(
            /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        );
    };

    const validate = (ev: Event) => {
        const value = (ev.target as HTMLInputElement).value;

        setIsValid(undefined);

        if (value === '') return;

        validateEmail(value) !== null ? setIsValid(true) : setIsValid(false);
    };


    const markTouched = () => {
        setIsTouched(true);
    };
    /* Email Validation */

    const history = useHistory();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const { data, error } = await HandleSignup(email, password);
        if (data?.user?.identities?.length === 0) {
            alert("This user already exists");
            history.push("/login")
        }
        if (error) {
            alert(error);
        }

    };


    return (
        <IonPage id="main">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Sign up</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Signup</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid className='ion-padding'>
                    <form onSubmit={handleSubmit}>
                        <IonRow>
                            <IonInput
                                className={`${isValid && 'ion-valid'} ${isValid === false && 'ion-invalid'} ${isTouched && 'ion-touched'}`}
                                type="email"
                                fill="solid"
                                label="Email"
                                labelPlacement="floating"
                                helperText="Enter a valid email"
                                errorText="Invalid email"
                                onIonInput={(event) => validate(event)}
                                onIonBlur={() => markTouched()}
                                onIonChange={(e) => setEmail(e.detail.value!)}
                                disabled={false}
                            />

                        </IonRow>
                        <IonRow>
                            <IonInput
                                type="password"
                                label="Password"
                                helperText="Type your password"
                                labelPlacement="floating"
                                counter={true}
                                maxlength={32}
                                minlength={8}
                                onIonChange={(e) => setPassword(e.detail.value!)}
                                disabled={false}
                            />
                        </IonRow>

                        <IonRow>
                            <IonCol className="ion-padding-top">
                                <IonButton type="submit" expand="block">Signup</IonButton>
                            </IonCol>
                        </IonRow>

                    </form>
                </IonGrid>








            </IonContent>
        </IonPage>
    );
};

export default Signup;