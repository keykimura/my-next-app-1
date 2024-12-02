import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const config: NextAuthConfig = {
    providers: [Google],
    basePath: "/api/auth",
    callbacks: {
        authorized({request, auth}){
            
            /* 認証後の処理 */
            try{
                const { pathname }  = request.nextUrl;
                if(pathname === "/createRoom") return !!auth;
                return true;
            } catch(err) {
                console.log(err);
            }
        },
        jwt({token, trigger, session}){
            if(trigger === "update") token.name = session.user.name;
            return token;
        },
    },
};

export const {handlers, auth, signIn, signOut} = NextAuth(config); /**/ 