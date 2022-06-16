import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { UsersService } from "src/users/users.service";

@Injectable()
export class ValidateUserPipe implements PipeTransform {
	constructor(private usersService: UsersService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const user = await this.usersService.findById(value);
		if (!user)
			throw new BadRequestException("invalid user_id")
		return value;
	}
}
@Injectable()
export class UserNameToIdPipe implements PipeTransform {
	constructor(private usersService: UsersService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const user = await this.usersService.findByChosenName(value);
		if (!user)
			throw new BadRequestException("invalid user chosen_name")
		return user.id;
	}
}
