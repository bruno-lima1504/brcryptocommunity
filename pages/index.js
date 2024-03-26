import Head from "next/head";
import styles from "../styles/Construcao.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Em Construção</title>
      </Head>

      <main className={styles.main}>
        <h1>Esta página está em construção</h1>
        <p>
          Desculpe pelo transtorno, estamos trabalhando nisso. Por favor, volte
          mais tarde!
        </p>
      </main>
    </div>
  );
}

export default Home;
