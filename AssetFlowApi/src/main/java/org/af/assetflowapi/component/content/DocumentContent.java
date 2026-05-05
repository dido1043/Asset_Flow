package org.af.assetflowapi.component.content;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.UserRepository;

import java.util.Optional;

@AllArgsConstructor
public class DocumentContent {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    public String returningProtocol(Long organizationId, Long userId, String assetsBlock){

        Optional<User> employeeName = userRepository.findById(userId);
        Optional<Organization> organization = organizationRepository.findById(organizationId);


        return """
                                ПРОТОКОЛ ЗА ВРЪЩАНЕ НА АКТИВИ
                I. Страни
                    -Dudunovski Web Services ЕООД (Организация) и Деян Дудуновски (Потребител)
                II. Предмет на връщането
                1. Лаптоп: марка: Lenovo - модел: ThinkPad X17 - Инвентарен номер: DWS-003
                III. Условия и разпоредби
                1. Активите се връщат на Организацията след прекратяване на трудовото
                правоотношение или по искане.
                2. Върнатите активи се приемат в добро състояние, с допустимо нормално
                износване.
                3. Всяка щета или липса се регистрира и се обезщетяват съгласно вътрешните
                политики на организацията.
                4. Получателят потвърждава, че активите са върнати напълно и в договорно
                състояние.
                IV. Подписи
                Dudunovski Web Solutions ЕООД:
                Деян Дудуновски: .......................... (подпис)
                Деян Д. Дудуновски: .......................... (подпис)
                """;
    }
}
