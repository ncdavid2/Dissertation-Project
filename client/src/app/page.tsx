import MainPage from "@/app/main_page/main/page";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:4000/",
  cache: new InMemoryCache()
});


function FirstPage() {
  return (
    <div>
      <MainPage />
    </div>
  );
}

export default FirstPage;