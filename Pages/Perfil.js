import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DatabaseConnection } from './conexao';
import { ScrollView } from 'react-native-gesture-handler';

const db = DatabaseConnection.getConnection();

const Perfil = () => {
  // CRIA A TABELA DE PROFISSIONAIS
    // DELETA A TABELA DE PROFISSIONAIS
    // db.transaction(tx => {
     // tx.executeSql(
        // 'DROP TABLE IF EXISTS professionals',
        // [],
        // (tx, result) => {
          // console.log('Tabela "profissionais" deletada com sucesso');
        // },
        // (tx, error) => {
          // console.log(`Erro ao deletar a tabela "profissionais": ${error.message}`);
        // }
      // );
    // });

    // CRIA A TABELA DE PROFISSIONAIS
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS professionals (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(100), role VARCHAR(100), social VARCHAR(100), description VARCHAR(1000), number VARCHAR(11))',
        [],
        (tx, result) => {
          console.log('Tabela "profissionais" criada com sucesso');
        },
        (tx, error) => {
          console.log(`Erro ao criar a tabela "profissionais": ${error.message}`);
        }
      );
    });

  const navigation = useNavigation();

  // const [filtro, setFiltro] = React.useState('Todos');
  const [perfilSelecionado, setPerfilSelecionado] = React.useState(null);
  const [profiles, setProfiles] = React.useState([]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM professionals',
          [],
          (tx, results) => {
            const data = [];
            for (let i = 0; i < results.rows.length; i++) {
              data.push(results.rows.item(i));
            }

            setProfiles(data);
          }
        );
      });
    });
    
    console.log(profiles);
    
    return unsubscribe;
  }, [navigation])

  const deleteProfessional = (profile) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM professionals WHERE id = ?',
        [profile.id],
        (tx, results) => {
          console.log('Profissional deletado com sucesso');
          setProfiles(profiles.filter((item) => item.id !== profile.id));
        },
        (tx, error) => {
          console.log(`Erro ao deletar o profissional: ${error.message}`);
        }
      );
    });
  }

  const handleDeleteProfessional = (profile) => {
    Alert.alert('Excluir', `Deseja excluir o profissional ${profile.name}?`, [
      {
        text: 'Não',
        style: 'cancel'
      },
      {
        text: 'Sim',
        onPress: () => deleteProfessional(profile)
      }
    ])
  }

  const handleEditProfessional = (profile) => {
    navigation.navigate('Profissional', { profile })
  }

  const handleGoToCreateProfessional = () => {
    navigation.navigate('Profissional', { profile: null })
  };

  // const handleFiltro = (filtroSelecionado) => {
  //   setFiltro(filtroSelecionado);
  //   setPerfilSelecionado(null);
  // };

  const handlePerfilSelecionado = (perfil) => {
    setPerfilSelecionado(perfil);
  };

  const handleContactWhatsApp = (number) => {
    const phoneNumber = number;
    const whatsappUrl = `https://wa.me/${phoneNumber}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          console.log('Não é possível abrir o WhatsApp');
        }
      })
      .catch((error) => console.log('Erro ao abrir o WhatsApp:', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nossos Profissionais</Text>
      {/*       
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filtro}
          style={styles.picker}
          onValueChange={(itemValue) => handleFiltro(itemValue)}
        >
          <Picker.Item label="Todos" value="Todos" />
          <Picker.Item label="Programadores" value="Programador" />
          <Picker.Item label="Analistas de Infraestutura" value="Analista de Infraestutura" />
          <Picker.Item label="Devops" value="Devops" />
          <Picker.Item label="Analistas de BI" value="Analista de BI" />
          <Picker.Item label="FrontEnds" value="FrontEnd" />
        </Picker>
      </View> */}

      {!perfilSelecionado && <View style={styles.profileContainer}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#4F4F4F' }]} onPress={handleGoToCreateProfessional}>
          <Text style={styles.buttonText}>Criar novo profissional</Text>
        </TouchableOpacity></View>}
      {perfilSelecionado ? (
        <View style={styles.profileContainer}>
          <Text style={styles.profileText}>{perfilSelecionado.role} {perfilSelecionado.name}</Text>
          <Text style={styles.profileExperience}>{perfilSelecionado.description}</Text>
          <Text style={styles.profileInstagram}>@{perfilSelecionado.social}</Text>
        </View>
      ) : (
        <ScrollView style={{ paddingHorizontal: 8 }}>
          {profiles.map((profile) => (
            <View style={[styles.profileContainer, { paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
              <TouchableOpacity
                key={profile.id}
                style={[styles.button, { backgroundColor: '#425B89' }]}
                onPress={() => handlePerfilSelecionado(profile)}
              >
                <Text style={styles.buttonText}>{profile.name}</Text>
              </TouchableOpacity>
              <View style={styles.containerButtons}>
                <TouchableOpacity style={[styles.button, { width: '50%', backgroundColor: '#228B22' }]} onPress={() => handleEditProfessional(profile)}>
                  <Text style={styles.buttonText}>
                    Editar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { width: '50%', backgroundColor: '#8B0000' }]}
                  onPress={() => handleDeleteProfessional(profile)}>
                  <Text style={styles.buttonText}>
                    Deletar
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#425B89' }]}
                onPress={() => handleContactWhatsApp(profile.number)}
              >
                <Text style={styles.buttonText}>Contato via WhatsApp</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.contactContainer}>
        <Text style={styles.contactText}>Siga-nos no Instagram:</Text>
        <Text style={styles.emailText}>@TI.freela</Text>
        <Text style={styles.contactText}>Para entrar em contato, envie um e-mail para:</Text>
        <Text style={styles.emailText}>contato.suporte@TIBRfreelancers.com.br</Text>
        <Text style={styles.contactText}>Clientes cadastrados ganham 10% de desconto no serviço contratado! FAÇA SEU CADASTRO!</Text>
        
      </View>

    </View>

  );
};
const styles = StyleSheet.create({

  picker: {
    backgroundColor: '#425B89',
    borderRadius: 8,
    marginTop: 10,
    color: '#fff',
  },
  profileContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 12,
  },
  containerButtons: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 8,
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#425B89',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#C0C0C0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 28,
    marginBottom: 12,
    color: '#425B89',
  },
});


export default Perfil;
