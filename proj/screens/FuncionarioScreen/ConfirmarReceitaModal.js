import React from "react";
import { View, Text, Button, Modal } from "react-native";
import styles from "../../styles";

export default function ConfirmarReceitaModal({
  modalVisivel,
  receitaSelecionada,
  confirmarReceita,
  setModalVisivel,
  estoque,
}) {
  return (
    <Modal visible={modalVisivel} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmar Receita</Text>

          {receitaSelecionada?.itens.map((i) => {
            const estoqueItem = estoque.find((e) => e.id === i.itemId);
            return (
              <Text key={i.itemId} style={styles.modalItemText}>
                • {estoqueItem ? estoqueItem.nome : "Item removido"}:{" "}
                {i.quantidade}
              </Text>
            );
          })}

          <View style={styles.modalButtons}>
            <Button title="Cancelar" onPress={() => setModalVisivel(false)} />
            <Button title="Confirmar" onPress={confirmarReceita} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
