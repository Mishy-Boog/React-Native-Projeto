import React from "react";
import { View, Text, Button, FlatList } from "react-native";
import styles from "../../styles";

export default function ReceitasSection({ receitas, estoque, abrirConfirmacao }) {
  return (
    <FlatList
      data={receitas}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const todosDisponiveis = item.itens.every((i) => {
          const estoqueItem = estoque.find((e) => e.id === i.itemId);
          return estoqueItem && estoqueItem.quantidade >= i.quantidade;
        });

        return (
          <View style={styles.listItem}>
            <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>

            {item.itens.map((i) => {
              const estoqueItem = estoque.find((e) => e.id === i.itemId);
              return (
                <Text key={i.itemId} style={{ fontSize: 12, color: "#555" }}>
                  • {estoqueItem ? estoqueItem.nome : "[Item não disponível]"}:{" "}
                  {i.quantidade}
                </Text>
              );
            })}

            {todosDisponiveis ? (
              <Button title="Fazer" onPress={() => abrirConfirmacao(item)} />
            ) : (
              <Text style={{ color: "red", marginTop: 5 }}>
                Itens insuficientes
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}
