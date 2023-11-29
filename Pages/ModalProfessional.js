import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { DatabaseConnection } from './conexao';

const db = DatabaseConnection.getConnection();

// With route params
export const ModalProfessional = ({ route }) => {
  const { profile } = route.params;

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setRole(profile.role);
      setDescription(profile.description);
      setSocial(profile.social);
      setNumber(profile.number);
    }
  }, [])

  const [name, setName] = useState(profile?.name);
  const [role, setRole] = useState(profile?.role);
  const [description, setDescription] = useState(profile?.description);
  const [social, setSocial] = useState(profile?.social);
  const [number, setNumber] = useState(profile?.number);

  const navigation = useNavigation();

  const handleUpdateProfessional = () => {
    if (!name || !role || !description || !social || !number) {
      Alert.alert('Erro na edição', 'Não é possível deixar campos vazios', [
        {
          style: 'cancel'
        }
      ]);

      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE professionals SET name=?, role=?, social=?, description=?, number=? WHERE id=?',
        [name, role, social, description, number, profile.id],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('Profissional atualizado com sucesso!');
          } else {
            console.log('Falha ao atualizar o profissional');
          }
        }
      );
    })

    clearInputs();

    Alert.alert('Sucesso', 'Você atualizou um profissional com sucesso.', [
      {
        text: 'Ok',
        onPress: handleNavigateToPerfil
      },
    ])
  }

  const handleCreateProfessional = () => {
    if (!name || !role || !description || !social || !number) {
      Alert.alert('Erro no cadastro', 'Insira todos os dados e tente novamente.', [
        {
          style: 'cancel'
        }
      ]);

      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO professionals (name, role, social, description, number) VALUES (?, ?, ?, ?, ?)',
        [name, role, social, description, `+55${number}`],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('Profissional criado com sucesso!');
          } else {
            console.log('Falha ao criar o profissional');
          }
        }
      );
    })

    clearInputs();

    Alert.alert('Sucesso', 'Você criou um profissional com sucesso.', [
      {
        text: 'Ok',
        onPress: handleNavigateToPerfil
      },
      {
        text: 'Cadastrar outro',
        style: 'cancel'
      }
    ])
  }

  const handleNavigateToPerfil = () => {
    navigation.navigate('Perfil')
  }

  const clearInputs = () => {
    setName('');
    setRole('');
    setDescription('');
    setSocial('');
    setNumber('');
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do profissional"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Cargo do profissional"
        value={role}
        onChangeText={setRole}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição para anúncio (experiências)"
        multiline={true}
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Rede social do profissional (Instagram)"
        value={social}
        onChangeText={setSocial}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone do profissional com DDD (WhatsApp)"
        value={number}
        onChangeText={setNumber}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={profile ? handleUpdateProfessional : handleCreateProfessional}>
        <Text style={styles.buttonText}>
          {profile ? 'Editar' : 'Cadastrar'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16
  },

  input: {
    padding: 12,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
  },

  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#425B89',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6
  },

  buttonText: {
    fontSize: 16,
    color: 'white'
  }
})