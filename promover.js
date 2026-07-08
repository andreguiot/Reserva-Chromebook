const { Sequelize } = require('sequelize');

// 1. COLE AQUI A "EXTERNAL DATABASE URL" DO SEU BANCO NO RENDER
const urlDoRender = "postgresql://chromebook_db_user:MqkSJ5zpvZvQuR6cLSqwThTXGttaJVvA@dpg-d96fb21o3t8c73ba3il0-a.oregon-postgres.render.com/chromebook_db";

// 2. COLE AQUI O SEU E-MAIL
const seuEmail = "andre.guiot@lasalle.org.br";

async function promover() {
    const sequelize = new Sequelize(urlDoRender, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco do Render com sucesso!');

        // Atualizando direto via SQL bruto para ser mais rápido e não depender dos Models locais
        const [resultados, metadata] = await sequelize.query(
            `UPDATE "usuarios" SET tipo_perfil = 'Admin' WHERE email = '${seuEmail}'`
        );

        if (metadata.rowCount > 0) {
            console.log(`🎉 Sucesso! A conta ${seuEmail} agora é ADMIN!`);
        } else {
            console.log(`⚠️ Usuário não encontrado. Você já logou pelo menos uma vez no site online?`);
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('Lembre-se de liberar o IP 0.0.0.0/0 no "Access Control" do Render!');
    } finally {
        await sequelize.close();
    }
}

promover();
